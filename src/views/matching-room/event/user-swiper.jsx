import { Undo2, X, Star, Heart, LucideHeart } from 'lucide-react'
import React, { useMemo, useState, useRef, useContext, useEffect } from 'react';
import TinderCard from 'react-tinder-card';
import { UserSwiperContext, useTranslation, useAPI, useLocation, ViewContext, AuthContext } from 'components/lib';
import Axios from 'axios';

const Advanced = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const parts = location.pathname.split('/');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState(null);
  const [lastSwipedUser, setLastSwipedUser] = useState(null);
  const userSwiperContext = useContext(UserSwiperContext)
  const viewContext = useContext(ViewContext);
  const context = useContext(AuthContext);
  const [superlikedUsers, setSuperlikedUsers] = useState([]);

  const currentIndexRef = useRef(currentIndex);

  const users = useAPI(`/api/matching/participants/${parts[2]}`);

  const childRefs = useRef([]);

  const updateCurrentIndex = (val) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const canSwipe = currentIndex >= 0;
  const canGoBack = lastSwipedUser !== null;

  const mergedUsers = useMemo(() => {
    if (!users?.data) return [];
    const filtered = users.data.filter(
      u => !superlikedUsers.find(s => s._id === u._id)
    );
    return [...filtered, ...superlikedUsers]; // superlikers first
  }, [superlikedUsers, users?.data]);

  useEffect(() => {
    if (mergedUsers?.[currentIndex]) {
      userSwiperContext.setActiveUser(mergedUsers?.[currentIndex]);
    } else {
      userSwiperContext.setActiveUser(null);
    }
  }, [currentIndex, mergedUsers]);

  useEffect(() => {
  const fetchSuperlikes = async () => {
    const res = await Axios.get(`/api/matching/incoming-superlikes/${parts[2]}`);
    setSuperlikedUsers(res.data.data?.map(dt => {
      return {
        ...dt,
        isPendingSuperlike: true
      }
    }));
  };
  fetchSuperlikes();
}, []);

  useEffect(() => {
  if (mergedUsers?.length > 0) {
    const last = mergedUsers.length - 1;
    setCurrentIndex(last);
    currentIndexRef.current = last;
  }
}, [mergedUsers]);

  const swiped = async (direction, name, index, id) => {
    const isSuperliker = superlikedUsers.find(u => u._id === id);
    
    if (isSuperliker) {
      viewContext.dialog.open({
        title: t(`matching_room.confirm_superlike.form.title_${direction === 'right' ? 'confirm' : 'reject'}`),
        form: {
          inputs: {
            eventId: {
              type: 'hidden',
              value: parts[2]
            },
            superlikeFromId: {
              type: 'hidden',
              value: users.data?.[currentIndex]
            },
            confirm: {
              type: 'hidden',
              value: direction === 'right'
            }
          },
          buttonText: t(`matching_room.confirm_superlike.form.button${direction === 'right' ? '' : '_reject'}`),
          url: '/api/matching/superlike/confirm',
          method: 'POST'
        }
      }, () => {
        setLastDirection(direction);
        setLastSwipedUser({ user: users.data?.[index], index });
        updateCurrentIndex(index - 1);
      });
    } else {
      try {
        const res = await Axios({
          method: 'POST',
          url: `/api/matching/swipe`,
          data: {
            targetId: id, eventId: parts[2], direction
          }
        });
        setLastDirection(direction);
        setLastSwipedUser({ user: users.data?.[index], index });
        updateCurrentIndex(index - 1);
      } catch (error) {
        console.log(error);
        
      }
    }

  };
  
  const swipe = async (dir) => {
    const index = currentIndexRef.current;
    if (index >= 0 && childRefs.current[index]) {
      try {
        const res = await Axios({
          method: 'POST',
          url: `/api/matching/swipe`,
          data: {
            targetId: users.data?.[index]?._id, eventId: parts[2], direction: dir
          }
        });
        await childRefs.current[index].swipe(dir);
        setLastDirection(dir);
      } catch (error) {
        console.log(error);
      }
    }

  };

  const handleUndo = async () => {
    if (!lastSwipedUser) return;

    const { index } = lastSwipedUser;

    if (!childRefs.current[index]?.restoreCard) {
      console.warn('restoreCard not available for index:', index);
      return;
    }

    viewContext.dialog.open({
      title: t('matching_room.undo.form.title'),
      form: {
        inputs: {
          eventId: {
            type: 'hidden',
            value: parts[2]
          }
        },
        buttonText: t('matching_room.undo.form.button'),
        url: '/api/matching/swipe/undo',
        method: 'POST'
      }
    }, () => {

      // First restore the card visually
      childRefs.current[index].restoreCard();

      // Then update the index state
      updateCurrentIndex(index);
      setLastSwipedUser(null);

      const user = JSON.parse(localStorage.getItem('user'));

      if (user && Array.isArray(user.accounts) && user.accounts[0]) {
        const currentVC = user.accounts[0].virtual_currency || 0;
        const updatedVC = currentVC + (res.data.data.quantity || 0);

        context.update({
          accounts: [
            {
              ...user.accounts[0],
              virtual_currency: updatedVC
            }
          ]
        });
      }

    });

  };

  const handleSuperlike = async () => {
    if (currentIndex < 0) return;
    viewContext.dialog.open({
      title: t('matching_room.superlike.form.title'),
      form: {
        inputs: {
          eventId: {
            type: 'hidden',
            value: parts[2]
          },
          targetId: {
            type: 'hidden',
            value: users.data?.[currentIndex]
          },
          direction: {
            type: 'hidden',
            value: 'superlike'
          }
        },
        buttonText: t('matching_room.superlike.form.button'),
        url: '/api/matching/swipe',
        method: 'POST'
      }
    }, async () => {
      await childRefs.current[currentIndex].swipe('right');
      setLastDirection('right');

      setCurrentIndex(currentIndex - 1);

      const user = JSON.parse(localStorage.getItem('user'));

      if (user && Array.isArray(user.accounts) && user.accounts[0]) {
        const currentVC = user.accounts[0].virtual_currency || 0;
        const updatedVC = currentVC + (res.data.data.quantity || 0);

        context.update({
          accounts: [
            {
              ...user.accounts[0],
              virtual_currency: updatedVC
            }
          ]
        });
      }

    });
  };

  const handleConfirmSuperlike = async (confirm) => {
    try {
      const res = await Axios({
        method: 'POST',
        url: `/api/matching/superlike/confirm`,
        data: {
          targetId: id, eventId: parts[2], confirm
        }
      });
      await childRefs.current[currentIndex].swipe('right');
      setLastDirection('right');

      setCurrentIndex(currentIndex - 1);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="w-full lg:min-h-[90vh] flex flex-col items-center justify-center">
      {
        canSwipe &&
        <div className="relative w-[90%] lg:w-[350px] h-[50vh] lg:h-[70vh]">
          {mergedUsers?.map((user, index) => (
            <TinderCard
              ref={(el) => (childRefs.current[index] = el)}
              className="absolute w-full h-full"
              key={user._id}
              onSwipe={(dir) => swiped(dir, user.first_name, index, user._id)}
              preventSwipe={['up', 'down']}
            >
              <div
                style={{ zIndex: index === currentIndex ? 100 : index }}
                className={`relative bg-white rounded-xl w-full h-full overflow-hidden flex flex-col justify-end cursor-grab transition-all duration-300 ease-in-out
                  ${user.isPendingSuperlike ? 'shadow-xl border-2 border-pink-500 ' : 'shadow-lg'}
                `}
              >

              {user.isPendingSuperlike && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 text-white text-sm font-semibold flex items-center gap-2 shadow-xl border border-white/30 backdrop-blur-sm animate-[pulseShadow_2s_infinite]">
                  <Star className="w-4 h-4 text-yellow-300 drop-shadow-sm" />
                  {t('matching_room.confirm_superlike.tag')}
                </div>
              )}


                <img
                  src={user.avatar}
                  alt={user.first_name}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />

                {/* Gradient overlay for text */}
                <div className="relative z-10 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <h2 className="text-2xl font-extrabold tracking-wide">
                    {user.first_name}, {user.age} ({user.gender})
                  </h2>
                  <p className="text-sm italic opacity-90">{user.description}</p>
                </div>
              </div>
            </TinderCard>
          ))}
        </div>
      }

      {/* Controls */}
      {canSwipe && (
        mergedUsers[currentIndex]?.isPendingSuperlike ? (
          <div className="flex gap-2 justify-center items-center mt-4 lg:mt-6 lg:gap-5">
            <button
              onClick={() => handleConfirmSuperlike(false)}
              className="bg-red-100 hover:bg-red-200 text-red-600 px-6 py-2 rounded-full shadow-lg text-sm font-medium"
            >
              {t('matching_room.confirm_superlike.no')}
            </button>
            <button
              onClick={() => handleConfirmSuperlike(true)}
              className="bg-green-100 hover:bg-green-200 text-green-600 px-6 py-2 rounded-full shadow-lg text-sm font-medium"
            >
              {t('matching_room.confirm_superlike.yes')}
            </button>
          </div>
        ) : (
          <div className="mt-4 lg:mt-6 flex justify-center gap-2 lg:gap-5">
            {
              (lastDirection === 'left' && !mergedUsers[currentIndex - 1]?.isPendingSuperlike) &&
              <button onClick={handleUndo} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-600 p-4 rounded-full shadow-lg">
                <Undo2 className="w-6 h-6" />
              </button>
            }
            <button onClick={() => swipe('left')} className="bg-red-100 hover:bg-red-200 text-red-600 p-4 rounded-full shadow-lg">
              <X className="w-6 h-6" />
            </button>
            <button onClick={handleSuperlike} className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-4 rounded-full shadow-lg">
              <Star className="w-6 h-6" />
            </button>
            <button onClick={() => swipe('right')} className="bg-green-100 hover:bg-green-200 text-green-600 p-4 rounded-full shadow-lg">
              <Heart className="w-6 h-6" />
            </button>
          </div>
        )
      )}

      {!canSwipe && (
        <div className="flex flex-col items-center justify-center mt-8 space-y-4 p-6 bg-gray-50 rounded-3xl shadow-lg max-w-sm mx-auto">
          <div className="text-gray-400">
            <LucideHeart className="w-12 h-12 mb-4 animate-pulse text-pink-500" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-800">{t('matching_room.no_more_user')}</h3>
          <p className="text-gray-600 text-center">
            {t('matching_room.no_more_description')}
          </p>
        </div>
      )}
    </div>
  );
};

export default Advanced;
