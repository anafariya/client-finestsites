/***
*
*   ONBOARDING
*   Example user onboarding flow.
*
**********/

import { Fragment, useContext, useRef, useState } from 'react';
import { AuthContext, Onboarding, Form, Alert, useAPI, Button, useNavigate } from 'components/lib';
import axios from 'axios';
import { Loader2, Camera } from "lucide-react";
import { UpcomingEventsTable } from '../dashboard/upcoming-event';

export function OnboardingView({ t }){

  const authContext = useContext(AuthContext);
  
  const views = [{

    name: t('onboarding.welcome.title'),
    description: `${t('onboarding.welcome.description')}, ${authContext.user.name}!`,
    component: <InviteUsers t={ t }/>,

  }]
  
  views.push({
  
    name: t('onboarding.profile_picture.title'),
    description: t('onboarding.profile_picture.description'),
    component: <ProfilePicture t={ t }/>,
      
  });

  if(!(authContext?.user?.is_invited)){
    views.push({

      name: t('onboarding.event.title'),
      description: t('onboarding.event.description'),
      component: <Events t={ t }/>,
      
    });
  }

  if (authContext.permission.admin){
  }

  if (authContext.user.duplicate_user){
    views.unshift({

      name: t('onboarding.duplicate_user.title'),
      description: '',
      component: <DuplicateUser t={ t }/>,

    })
  }

  return <Onboarding save onFinish='/dashboard' views={ views }/>

}

function DuplicateUser({ t }){

  return (
    <Alert
      variant='warning'
      title={ t('onboarding.duplicate_user.message.title') }
      description={ t('onboarding.duplicate_user.message.description') }
    />    
  )
}

function Events({t}) {
  const events = useAPI('/api/events');
  
  return <UpcomingEventsTable t={t} events={events?.data} isOnboarding={true} />
} 

export default function ProfilePicture({ t }) {
  const fileInputRef = useRef(null);
  const authContext = useContext(AuthContext);
  const user = useAPI("/api/user");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const currentAvatar = preview || user?.data?.avatar;

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const { data: presigned } = await axios.patch("/api/user/onboarding-2", {
        image: file.name,
      });

      if (presigned.files_to_upload?.length) {
        await axios.put(presigned.files_to_upload[0].url, file, {
          headers: {
            "Content-Type": file.type,
          },
        });

        authContext?.refreshUser?.();
        authContext.update({ avatar: currentAvatar });
        navigate(user.data.is_invited ? "/dashboard" : "/welcome?page=3");
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Fragment>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 px-4 text-center">
        <div className="relative group w-40 h-40 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-lg border-2 border-gray-300 cursor-pointer transition hover:scale-105" onClick={openFilePicker}>
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Profile"
              className="object-cover object-center w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
              {t("No Image")}
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 text-lg rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-5 h-5" /> {t("Uploading...")}
            </span>
          ) : (
            t("Upload Profile Picture")
          )}
        </Button>
      </div>
    </Fragment>
  );
}


function InviteUsers({ t }){
  const user = useAPI('/api/user');
  const authContext = useContext(AuthContext);
  
  return (
    <Form
      buttonText={ t('account.profile.profile.form.button') }
      url='/api/user/onboarding-1'
      method='PATCH'
      redirect={'/welcome?page=2'}
      inputs={{
        first_name: {
          label: t('account.profile.profile.form.first_name.label'),
          type: 'text',
          required: true,
          value: user?.data?.first_name || user?.data?.name?.split(' ')[0],
          errorMessage: t('account.profile.profile.form.first_name.error'),
        },
        last_name: {
          label: t('account.profile.profile.form.last_name.label'),
          type: 'text',
          required: true,
          value: user?.data?.last_name || user?.data?.name?.split(' ')[1],
          errorMessage: t('account.profile.profile.form.last_name.error'),
        },
        gender: {
          label: t('account.profile.profile.form.gender.label'),
          type: 'select',
          required: true,
          defaultValue: user?.data?.gender,
          options: [
            { value: 'male', label: t('account.profile.profile.gender.male') },
            { value: 'female', label: t('account.profile.profile.gender.female') },
            { value: 'diverse', label: t('account.profile.profile.gender.diverse') }
          ],
        },
        date_of_birth: {
          label: t('account.profile.profile.form.dob.label'),
          type: 'date',
          required: true,
          value: user?.data?.date_of_birth,
          defaultValue: user?.data?.date_of_birth
        },
        interests: {
          label: t('account.profile.profile.form.interests.label'),
          type: 'tags',
          required: true,
          defaultValue: user?.data?.interests,
          placeholder: t('account.profile.profile.form.interests.placeholder'),
          description: t('account.profile.profile.form.interests.description'),
        },
        looking_for: {
          label: t('account.profile.profile.form.looking_for.label'),
          type: 'select',
          required: true,
          defaultValue: user?.data?.looking_for,
          placeholder: t('account.profile.profile.form.looking_for.placeholder'),
          options: [
            { value: 'male', label: t('account.profile.profile.gender.male') },
            { value: 'female', label: t('account.profile.profile.gender.female') },
            { value: 'both', label: t('account.profile.profile.gender.both') }
          ],
        },
        relationship_goal: {
          label: t('account.profile.profile.form.relationship_goal.label'),
          type: 'select',
          required: true,
          defaultValue: user?.data?.relationship_goal,
          placeholder: t('account.profile.profile.form.relationship_goal.placeholder'),
          options: [
            { value: 'relationship', label: t('account.profile.profile.relationship_goal.relationship') },
            { value: 'friendship', label: t('account.profile.profile.relationship_goal.friendship') }
          ]
        },
        children: {
          label: t('account.profile.profile.form.children.label'),
          type: 'select',
          required: true,
          defaultValue: user?.data?.children ? 'Yes' : 'No',
          options: [
            { value: 'Yes', label: t('account.profile.profile.children.yes') },
            { value: 'No', label: t('account.profile.profile.children.no') }
          ],
        },
        profession: {
          label: t('account.profile.profile.form.profession.label'),
          type: 'tags',
          required: true,
          defaultValue: user?.data?.profession,
          placeholder: t('account.profile.profile.form.profession.placeholder'),
        },
        smoking_status: {
          label: t('account.profile.profile.form.smoking_status.label'),
          type: 'select',
          required: true,
          defaultValue: user?.data?.smoking_status ? 'Yes' : 'No',
          options: [
            { value: 'Yes', label: t('account.profile.profile.smoking_status.yes') },
            { value: 'No', label: t('account.profile.profile.smoking_status.no') }
          ],
        },
        description: {
          label: t('account.profile.profile.form.description.label'),
          type: 'textarea',
          rows: 4,
          required: false,
          value: user?.data?.description,
        }
      }}
      callback={ res => {

        const data = res.data.data;

        // update the account name
        if (data.account_name && authContext.user?.accounts?.length > 0){

          const accounts = [...authContext.user.accounts]
          accounts[accounts.findIndex(x => x.id === authContext.user.account_id)].name = data.account_name;
          authContext.update({ accounts: accounts })

        }

        // update the user name
        if (data.name)
          authContext.update({ name: data.name });

        // update the avatar
        if (data.avatar)
          authContext.update({ avatar: data.avatar });
      }}
    />
  )
}