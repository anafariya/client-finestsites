import React, { useState, useContext } from "react";
import { Card, CardContent } from "components/shadcn/card";
import { Badge } from "components/shadcn/badge";
import { Button } from "components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "components/shadcn/dialog";
import { LucideMessageCircle } from "lucide-react";
import { useNavigate, useTranslation, ViewContext, useAPI, useLocation } from 'components/lib';

const UserProfile = ({ user }) => {
  const viewContext = useContext(ViewContext);
  const { t } = useTranslation()
  const router = useNavigate();
  const {
    first_name,
    age,
    gender,
    interests,
    looking_for,
    images = [],
    description,
    smoking_status,
    profession,
    event_id,
    chat_id,
    relationship_goal,
    children,
    _id
  } = user || {};

  const mainPhoto = images?.[0] ?? "/data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAMFBMVEXx8/XCy9K/yND09vfw8vTP1tzp7O/i5ure4+fO1dvJ0dfT2d/EzNPt7/Lb4OXo6+4FeM7UAAAFL0lEQVR4nO2c24KrIAxFLdha7///t0dxOlWDSiAKztnrbR4G6SoJBKHZA6zJYncgQeCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ocEKBEwqcUOCEAicUOKHACQVOKHBCgRMKnFDghAInFDihwAkFTihwQoETCpxQ4IQCJxQ4ocAJBU4ot3Oi1KMq64FnWTVq+EueWzlRquqKVn/J+/ezEfdyHydKPYtc62yF1m1Xymq5ixPVdDnx8eslf1eCVu7hRFXFppAfLW39kNJyByeqOTJirGTvRsbKDZyozsHIpKUQsZK8E1Vu55GTrKTuRL0ZRoyVLviZaTtRVctUMuaVOnCoJO1E1WwjxsorbGZO2Qk7br5WuhApKTvpfZWMy5WAoZKuk6b1NhI4VJJ10uRBSsas0ng+OlUnVaARw9NvqCTqRERJpt9eUtJ0IqPEN36SdNIIKRnIPeafFJ0Ep9c5mr+qTdFJ2CRMpLAn5fScqJeokrFWZkoRdaImwtpw2T9iSnnxuiDoRFXda6hK28JzWTA14ryBxKFlTT9iTlT1W57o3Lta96yED8krRieknCw/DDuEP1TnKBlgzMlCTtZDXr+8pIjOwitK5x7JOKFD3mukiE85ix45S5FxYll46prdiv8ekpsU19wv4kS9LV1ouQPlrPzKliIzTuw9YDYiVfgFSxFx8rR+wcyMomSX9HYpTjlFwonqrB3gBc/JyYQjRcRJYe8Ay4l9rMlLcVi8iTjp7Y/nOBHcMjngWEoi4+TUlcmKw9rnxHzCWMqeU/ltkB9JEZl3SusnYmwQn1fm2GgPeiOzZrM9WZfu/3/BNDznYATLOLENffep+JppeMZBMSZUF9N6ljFM7KF3qpTduBZyQj4W53XTiRsEm1L2dr2k9k9W9Rtjq2BrJj9Zyk7pI7bP9lw8kfH+4KIFLGF77Sa3R90Un0POvHNCcYzsLVMk9+2buni1bd9xjMSJHMPmjCz7zov/fidW5GQ7OS/2e8BoRrLtrBfXScTIMVLsk09cJxEjZ8I6+cR1EmG1tsRaDsZ0EjlyDL0leuxOpulD4JTALtfXORRbnqVO1LDOePdtpoclWPsqulL+wt0P0SNnxFKrrp2opmuXl+5OuHA3PSmByDGQ9ezSydYdM+ELd4YUIsdANnoWTva2RSUv3JlnJRE5I2RbY+6kee1+dTrrhC7cPTZeMUdivZnydaIc3tdqqWuI6USOYZlSfp0oxzVlJxNByUSOYZlSPk6cDzqEXy17JDTn/LBMKRlTSRZ4X2giep2zZnEwZHLiGjifFt6BTtKKHMMspUxO2BkvDzoDm1jkGGa7bsaJx0t9XfgrOfuMlhezwsc48RrKufvhyiXXHatg8T2Zkm0eHzluxO8W4pXHKljkXycBt3h9blFdeqyCx2fPOguLbn6qTWsBu+Czxs/CopsdP4kmkx+mcZ8FRrfuWUqSTSYT005keDucW4iXnzRhMg17iYacC6A0VyZzzIQs0pBrUrn22JoXY4Us0pDjaZMzb+dIMX6/Qi0dHSU0XHySz48heqSaOs60vsvlq2mtpzj9OCh/Trgjew7afgLar63d6ec2SmTZm37+UyV7048K+Gmkm7O10A/8aaSbY7sEr8rYvYoNnX4Sr3EuYJVpVc35Ccu/innZbryMJ1n4v9f4N9FZ39XPZ931GYzMGH9VPHYfAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADp8Q9+nG9anuOrfAAAAABJRU5ErkJggg==";

  const handleMoveToChat = (id, eventId, chatId) => {
    if(id && eventId){
      if(!chatId){
        viewContext.dialog.open({
          title: t('matches.unlock_chat'),
          description: t('matches.unlock_question'),
          form: {
            inputs: {
              targetId: {
                type: 'hidden',
                value: id,
              },
              eventId: {
                type: 'hidden',
                value: eventId,
              }
            },
            url: '/api/matching/unlock-chat',
            method: 'POST',
            buttonText: t('matches.unlock'),
          }
        }, (data, res) => {
          router(`/inbox/${res?.data?.chat_id}`)
        });
      } else {
        router(`/inbox/${chatId}`)
      }
    }
  }
  
  return (
    <div className="mb-10">
      {/* Hero Photo */}
      <div className="relative h-[500px] w-full overflow-hidden rounded-b-3xl shadow-xl max-w-4xl mx-auto">
        {
          mainPhoto &&
          <img
            src={mainPhoto}
            alt={`${first_name || ''} profile`}
            className="w-full h-full object-cover object-center"
          />
        }
        <div className="absolute bottom-0 bg-gradient-to-t from-black/70 to-transparent w-full px-6 py-4 text-white">
          <h2 className="text-4xl font-bold">
            {first_name}, {age}
          </h2>
          <p className="text-sm text-pink-200">{gender ? t(`account.profile.profile.gender.${gender}`): '-'}</p>
          {/* Profession */}
          {profession && (
            <p className="text-sm mt-1 text-white/90">
              {t('account.profile.profile.form.profession.label')}: {profession}
            </p>
          )}
          {/* Smoking Status */}
          {smoking_status && (
            <p className="text-sm mt-0.5 text-white/90">
              {t('account.profile.profile.form.smoking_status.label')}: {smoking_status ? t('account.profile.profile.smoking_status.yes') : t('account.profile.profile.smoking_status.no')}
            </p>
          )}
        </div>
      </div>

      <Card className="-mt-16 shadow-lg border-0 rounded-3xl max-w-5xl mx-auto">
        <CardContent className="p-6 space-y-6">
          {/* Description */}
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-gray-800">{t('account.profile.profile.form.description.label')}</h3>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>

          {/* Interests */}
          {interests?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.profile.form.interests.label')}</h4>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-pink-600 border-pink-300 bg-pink-50"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Looking For */}
          {looking_for && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.profile.form.looking_for.label')}</h4>
              <p className="text-gray-700">{looking_for ? t(`account.profile.profile.gender.${looking_for}`) : '-'}</p>
            </div>
          )}

          {/* Relationship Goal */}
          {relationship_goal && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.profile.form.relationship_goal.label')}</h4>
              <p className="text-gray-700">{relationship_goal ? t(`account.profile.profile.relationship_goal.${relationship_goal}`) : '-'}</p>
            </div>
          )}

          {/* Children */}
          {children && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.profile.form.children.label')}</h4>
              <p className="text-gray-700">{children ? t(`account.profile.profile.children.yes`) : t(`account.profile.profile.children.no`)}</p>
            </div>
          )}

          {/* Gallery */}
          {images.length > 1 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{t('account.profile.gallery')}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.slice(1).map((photo, index) => (
                  <Dialog key={index}>
                    <DialogTrigger asChild>
                      <img
                        src={photo}
                        alt={`Gallery ${index}`}
                        className="rounded-xl object-cover h-40 w-full cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md"
                      />
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">
                      <img src={photo} alt={`Modal ${index}`} className="w-full h-auto" />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <div className="flex justify-center">
            <Button 
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 text-base rounded-full flex items-center gap-2"
              onClick={() => handleMoveToChat(_id, event_id, chat_id)}
            >
              <LucideMessageCircle className="size-5" />
              {t('account.profile.send_a_message')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Profile = () => {
    const location = useLocation();
    const parts = location.pathname.split('/');
    const user = useAPI(`/api/user/profile/${parts[2]}`, 'GET');
    
    return <UserProfile user={user.data} />;
}

export default Profile;