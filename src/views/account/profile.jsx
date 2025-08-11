"use client";

import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Input
} from 'components/shadcn/input'
import {
  Label
} from 'components/shadcn/label'
import {
  Switch
} from 'components/shadcn/switch'
import {
  Button
} from 'components/shadcn/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from 'components/shadcn/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from 'components/shadcn/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "components/shadcn/dialog";
import { Plus, X, Trash2, Pencil, UserRound, Mail, Heart, Camera, Calendar, Star, StarOff, Briefcase, Cigarette, Gem, Baby } from "lucide-react";
import { AuthContext, ViewContext, Animate, Form, useAPI, useNavigate, Event, cn } from 'components/lib';
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';

const MAX_PHOTOS = 4;

export function Profile({ t }) {
  const navigate = useNavigate();
  const [openProfile, setOpenProfile] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [photos, setPhotos] = useState([]);
  const fileRef = useRef(null);
  const replaceIndex = useRef(null);
  const authContext = useContext(AuthContext);
  const viewContext = useContext(ViewContext);
  const [profileIndex, setProfileIndex] = useState(0);
  const [isReload, setIsReload] = useState(0);
  const user = useAPI('/api/user', 'GET', isReload);
  const [uploadingIndexes, setUploadingIndexes] = useState([]);
  const [imagesUpdated, setImagesUpdated] = useState([]);

  const addPhotos = async (files) => {
    if (!files) return;

    const limitedFiles = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    const urls = limitedFiles.map((f) => URL.createObjectURL(f));
    setPhotos((prev) => [...prev, ...Array.from(files).map((file) => ({
      name: file.name, // actual filename
      url: URL.createObjectURL(file), // preview blob URL
    })),]);
    const startIndex = photos.length;
    const newUploadingIndexes = limitedFiles.map((_, i) => startIndex + i);
    setUploadingIndexes((prev) => [...prev, ...newUploadingIndexes]);
    try {
      for (let i = 0; i < limitedFiles.length; i++) {
        const file = limitedFiles[i];
        const { data: presigned } = await axios.patch("/api/user/photos", {
          image: file.name,
          action: 'add'
        });

        if (presigned.files_to_upload?.length) {
          await axios.put(presigned.files_to_upload[0].url, file, {
            headers: { "Content-Type": file.type },
          });
        }
        setImagesUpdated(presigned.image_lists);
        // Remove from uploading state after finished
        setUploadingIndexes((prev) => prev.filter((idx) => idx !== startIndex + i));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingIndexes([]);
    }
  };

  const handleFile = (e) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const totalFiles = photos.length + selectedFiles.length;
    if (totalFiles > MAX_PHOTOS) {
      alert(`You can only upload up to ${MAX_PHOTOS} photos.`);
      return;
    }

    addPhotos(selectedFiles);
  };

  const handleReplace = async (e) => {
    const file = e.target.files?.[0];
    const index = replaceIndex.current;

    if (!file || index === null) return;

    setUploadingIndexes((prev) => [...prev, index]); // ✅ mark uploading this image

    try {
      const oldFilename = photos[index]?.url ? photos[index]?.name.split('/').pop() : photos[index]?.split('/').pop();

      // 1. Request presigned URL
      const { data: presigned } = await axios.patch("/api/user/photos", {
        image: file.name,
        action: 'edit',
      });

      if (presigned?.files_to_upload?.length) {
        // 2. Upload to Wasabi
        await axios.put(presigned.files_to_upload[0].url, file, {
          headers: { 'Content-Type': file.type },
        });

        // 3. Remove old image if needed
        if (oldFilename) {
          await axios.patch("/api/user/photos", {
            image: oldFilename.startsWith('user-') ? oldFilename.split('?')[0] : (imagesUpdated[index]?.split('/').pop()),
            action: "remove",
          });
        }

        // 4. Update UI
        const newUrl = URL.createObjectURL(file);
        setPhotos((prev) => prev.map((p, i) => (i === index ? newUrl : p)));

        if (profileIndex === index) {
          authContext.update({ avatar: newUrl });
        }

        replaceIndex.current = null;
      }
    } catch (err) {
      console.error("Replace failed", err);
    } finally {
      // ✅ remove index from uploading list
      setUploadingIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  const deletePhoto = async (index) => {
    try {
      const filename = photos[index]?.url ? photos[index]?.name.split('/').pop() : photos[index]?.split('/').pop(); // Extract filename if it's a full URL
      if (!filename) return;

      const res = await axios.patch("/api/user/photos", {
        image: filename.split('?')[0],
        action: 'remove',
      });
      setPhotos((prev) => prev.filter((_, i) => i !== index));
      setImagesUpdated(res.data.image_lists);
      // Also remove from profileIndex if deleted photo was the avatar
      if (profileIndex === index) {
        setProfileIndex(0); // Or null
      } else if (profileIndex > index) {
        setProfileIndex(profileIndex - 1); // Adjust index shift
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
    
  };

  const handleAvatar = async (index) => {
    try {
      const filename = photos[index]?.url ? photos[index]?.name.split('/').pop() : photos[index]?.split('/').pop(); // Extract filename if it's a full URL
      if (!filename) return;

      const res = await axios.patch("/api/user/avatar", {
        image: filename.startsWith('user-') ? filename.split('?')[0] : (imagesUpdated[index]?.split('/').pop()),
      });
      setProfileIndex(index);
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  const openGallery = (idx) => {
    setActiveIndex(idx);
    setGalleryOpen(true);
  };

  function closeAccount(){
    viewContext.dialog.open({

      title: t('account.profile.close_account.title'),
      description: t('account.profile.close_account.description'),
      form: {
        inputs: {
          password: {
            label: t('account.profile.close_account.form.password.label'),
            description: t('account.profile.close_account.form.password.description'),
            type: 'password',
            required: true,
          }
        },
        method: 'DELETE',
        destructive: true,
        url: authContext.permission.owner ? '/api/account' : '/api/user',
        buttonText: t('account.profile.close_account.button'),
      },
    }, () => {

      // destory user
      Event({ name: 'closed_account' });
      localStorage.clear();
      window.location.reload();
      return window.location.replace('/signin');
      
    });
  }

  useEffect(() => {
    if (photos.length === 1) {
      setProfileIndex(0);
    } else {
      setProfileIndex(photos.findIndex(dt => {
        const photo = (dt?.split('/').pop())?.split('?')?.[0]
        const avatar = (user?.data?.avatar?.split('/').pop())?.split('?')?.[0]
        return photo === avatar
      }))
    }
  }, [photos, user?.data?.avatar]);

  useEffect(() => {
    setPhotos(user?.data?.images || [])
  }, [user?.data?.images]);

  function formatDateString(d){
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return d ? formatter.format(new Date(d)) : '-';

  }

  function getAgeFromDate(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const hasHadBirthdayThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

    if (!hasHadBirthdayThisYear) {
      age--;
    }

    return age;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">

      {/* ===== Account Overview Card ===== */}
      <Card className="overflow-hidden shadow-lg rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-slate-500 via-purple-500 to-pink-500 p-6">
          <div className="flex items-center gap-4">
            <div className="text-white">
              <CardTitle className="text-2xl font-semibold tracking-wide drop-shadow-md">
                {user?.data?.first_name || '-'} {user?.data?.last_name}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          {/* EMAIL */}
          <Detail icon={Mail} label={t('account.profile.profile.form.email.label')} value={user?.data?.email || '-'} />
          {/* GENDER */}
          <Detail icon={UserRound} label={t('account.profile.profile.form.gender.label')} value={user?.data?.gender ? t(`account.profile.profile.gender.${user?.data?.gender.toLowerCase()}`) : '-'} />
          {/* DOB */}
          <Detail icon={Calendar} label={t('account.profile.profile.form.dob.label')} value={formatDateString(user?.data?.date_of_birth)} />
          {/* AGE */}
          <Detail label={t('account.profile.profile.form.age.label')} value={user?.data?.date_of_birth ? getAgeFromDate(user?.data?.date_of_birth) : '-'} />
          {/* PROFESSION */}
          <Detail
            icon={Briefcase} // You can use another icon if preferred
            label={t('account.profile.profile.form.profession.label')}
            value={user?.data?.profession || '-'}
          />
          {/* SMOKING STATUS */}
          <Detail
            icon={Cigarette} // Optional: choose a different icon if needed
            label={t('account.profile.profile.form.smoking_status.label')}
            value={user?.data?.smoking_status ? t('account.profile.profile.smoking_status.yes') : t('account.profile.profile.smoking_status.no')}
          />
          {/* INTERESTS */}
          <Detail
            icon={Camera}
            label={t('account.profile.profile.form.interests.label')}
            value={user?.data?.interests?.join(", ") || '-'}
          />
          {/* LOOKING FOR */}
          <Detail
            icon={Heart}
            label={t('account.profile.profile.form.looking_for.label')}
            value={user?.data?.looking_for ? t(`account.profile.profile.gender.${user?.data?.looking_for}`) : '-'}
          />
          {/* Relationship Goal */}
          <Detail
            icon={Gem}
            label={t('account.profile.profile.form.relationship_goal.label')}
            value={user?.data?.relationship_goal ? t(`account.profile.profile.relationship_goal.${user?.data?.relationship_goal}`) : '-'}
          />
          {/* Children */}
          <Detail
            icon={Baby}
            label={t('account.profile.profile.form.children.label')}
            value={user?.data?.children ? t('account.profile.profile.children.yes') : t('account.profile.profile.children.no')}
            className="md:col-span-2 lg:col-span-3"
          />
          {/* Kind of Person */}
          <Detail
            label={t('dashboard.facts.1.title')}
            value={user?.data?.kind_of_person ? t(`dashboard.facts.1.options.${user?.data?.kind_of_person.toLowerCase()}`) : '-'}
            className="md:col-span-2 lg:col-span-3"
          />

          {/* Feel Around New People */}
          <Detail
            label={t('dashboard.facts.2.title')}
            value={user?.data?.feel_around_new_people ? t(`dashboard.facts.2.options.${user?.data?.feel_around_new_people.toLowerCase()}`) : '-'}
            className="md:col-span-2 lg:col-span-3"
          />

          {/* Prefer Spending Time */}
          <Detail
            label={t('dashboard.facts.3.title')}
            value={user?.data?.prefer_spending_time ? t(`dashboard.facts.3.options.${user?.data?.prefer_spending_time.toLowerCase()}`) : '-'}
            className="md:col-span-2 lg:col-span-3"
          />

          {/* Describe You Better */}
          <Detail
            label={t('dashboard.facts.4.title')}
            value={user?.data?.describe_you_better ? t(`dashboard.facts.4.options.${user?.data?.describe_you_better.toLowerCase()}`) : '-'}
            className="md:col-span-2 lg:col-span-3"
          />

          {/* Describe Role in Relationship */}
          <Detail
            label={t('dashboard.facts.5.title')}
            value={user?.data?.describe_role_in_relationship ? t(`dashboard.facts.5.options.${user?.data?.describe_role_in_relationship.toLowerCase()}`) : '-'}
            className="md:col-span-2 lg:col-span-3"
          />
          {/* DESCRIPTION */}
          <div className="md:col-span-2 lg:col-span-3 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{t('account.profile.profile.form.description.label')}</p>
            <p className="text-base leading-relaxed">
              {user?.data?.description || '-'}
            </p>
          </div>
          {/* ACTIONS */}
          <div className="flex flex-col gap-3 md:col-span-2 lg:col-span-3 sm:flex-row">
            <Button size="sm" onClick={() => setOpenProfile(true)} className="flex-1">
              {t('account.profile.edit_btn')}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOpenPassword(true)} className="flex-1">
              {t('account.profile.change_password')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== Photos Section ===== */}
      <Card>
        <CardHeader>
          <CardTitle> {t('account.profile.your_photos')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {photos.map((src, i) => {
              const isUploading = uploadingIndexes.includes(i);

              return (
                <div
                  key={i}
                  className="group relative aspect-square overflow-hidden rounded-lg shadow hover:shadow-lg"
                >
                  {/* Clickable Image */}
                  <button
                    disabled={isUploading}
                    onClick={() => openGallery(i)}
                    className="absolute inset-0 h-full w-full"
                  >
                    <img
                      src={src.url || src}
                      alt={`photo-${i}`}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  </button>

                  {/* Uploading Spinner */}
                  {isUploading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 flex items-start justify-end gap-1 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="bg-white/70 backdrop-blur-sm"
                      onClick={() => {
                        replaceIndex.current = i;
                        fileRef.current?.click();
                      }}
                      disabled={isUploading}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {photos.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="bg-white/70 backdrop-blur-sm"
                        onClick={() => deletePhoto(i)}
                        disabled={isUploading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Avatar Toggle */}
                  <div className="absolute bottom-1 left-1">
                    <Button
                      size="sm"
                      variant={profileIndex === i ? 'default' : 'ghost'}
                      className={cn(
                        'text-xs px-2 py-1',
                        profileIndex !== i &&
                          'transition-opacity opacity-0 group-hover:opacity-100 flex gap-1 bg-white/70 backdrop-blur-sm'
                      )}
                      onClick={() => profileIndex !== i && handleAvatar(i)}
                      disabled={isUploading}
                    >
                      {profileIndex === i ? (
                        <>
                          <Star className="mr-[2px] h-4 w-4" />
                          {t('account.profile.avatar')}
                        </>
                      ) : (
                        <>
                          <StarOff className="mr-[2px] h-4 w-4" />
                          {t('account.profile.set_avatar')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {photos.length < MAX_PHOTOS && (
              <label className="flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/40 hover:border-primary/60">
                <Plus className="h-8 w-8 text-muted-foreground" />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFile}
                />
              </label>
            )}
          </div>

          {/* Hidden input for replace */}
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileRef}
            onChange={handleReplace}
          />
        </CardContent>
      </Card>

      {/* ===== Notification Preferences Card ===== */}
      {/* <Card>
        <CardHeader>
          <CardTitle>{t('account.notifications.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email_notifications">{t('account.notifications.email_notifications')}</Label>
            <Switch id="email_notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push_notifications">{t('account.notifications.push_notifications')}</Label>
            <Switch id="push_notifications" />
          </div>
          <Button>{t('account.notifications.update')}</Button>
        </CardContent>
      </Card> */}

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">{t('account.profile.close_account.header')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
          {t('account.profile.close_account.subtitle')}
          </p>
          <Button
            variant="destructive"
            className="w-full sm:max-w-xs"
            onClick={closeAccount}
          >
            {t("account.profile.close_account.title")}
          </Button>
        </CardContent>
      </Card>

      {/* ===== Edit Profile Modal ===== */}
      <Dialog open={openProfile} onOpenChange={setOpenProfile}>
        <DialogContent className="sm:max-w-xl bg-white z-[59]">
          <DialogHeader>
            <DialogTitle>{t('account.profile.profile.form.edit_profile')}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            { user?.data &&
              <Form
                buttonText={ t('account.profile.profile.form.button') }
                url='/api/user'
                method='PATCH'
                inputs={{
                  first_name: {
                    label: t('account.profile.profile.form.first_name.label'),
                    type: 'text',
                    required: true,
                    value: user?.data?.first_name,
                    errorMessage: t('account.profile.profile.form.first_name.error'),
                  },
                  last_name: {
                    label: t('account.profile.profile.form.last_name.label'),
                    type: 'text',
                    required: true,
                    value: user?.data?.last_name,
                    errorMessage: t('account.profile.profile.form.last_name.error'),
                  },
                  email: {
                    label: t('account.profile.profile.form.email.label'),
                    type: 'email',
                    required: true,
                    value: user?.data?.email,
                    errorMessage:  t('account.profile.profile.form.email.error'),
                  },
                  gender: {
                    label: t('account.profile.profile.form.gender.label'),
                    type: 'select',
                    required: false,
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
                    required: false,
                    defaultValue: user?.data?.date_of_birth,
                    value: user?.data?.date_of_birth,
                  },
                  interests: {
                    label: t('account.profile.profile.form.interests.label'),
                    type: 'tags',
                    required: false,
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
                    required: false,
                    defaultValue: user?.data?.profession,
                    placeholder: t('account.profile.profile.form.profession.placeholder'),
                  },
                  smoking_status: {
                    label: t('account.profile.profile.form.smoking_status.label'),
                    type: 'select',
                    required: false,
                    defaultValue: user?.data?.smoking_status ? 'Yes' : 'No',
                    options: [
                      { value: 'Yes', label: t('account.profile.profile.smoking_status.yes') },
                      { value: 'No', label: t('account.profile.profile.smoking_status.no') }
                    ],
                  },
                  kind_of_person: {
                    label: t('dashboard.facts.1.title'),
                    type: 'radio',
                    required: true,
                    defaultValue: user?.data?.kind_of_person,
                    // placeholder: t('dashboard.facts.1.title'),
                    options: [
                      { label: t('dashboard.facts.1.options.similar'), value: 'similar' },
                      { label: t('dashboard.facts.1.options.opposite'), value: 'opposite' }
                    ]
                  },

                  feel_around_new_people: {
                    label: t('dashboard.facts.2.title'),
                    type: 'radio',
                    required: true,
                    defaultValue: user?.data?.feel_around_new_people,
                    // placeholder: t('dashboard.facts.2.title'),
                    options: [
                      { label: t('dashboard.facts.2.options.introvert'), value: 'introvert' },
                      { label: t('dashboard.facts.2.options.extrovert'), value: 'extrovert' },
                      { label: t('dashboard.facts.2.options.ambivert'), value: 'ambivert' }
                    ],
                  },

                  prefer_spending_time: {
                    label: t('dashboard.facts.3.title'),
                    type: 'radio',
                    required: true,
                    defaultValue: user?.data?.prefer_spending_time,
                    // placeholder: t('dashboard.facts.3.title'),
                    options: [
                      { label: t('dashboard.facts.3.options.closeness_seeker'), value: 'closeness_seeker' },
                      { label: t('dashboard.facts.3.options.activity_seeker'), value: 'activity_seeker' },
                      { label: t('dashboard.facts.3.options.both_seeker'), value: 'both_seeker' }
                    ],
                  },

                  describe_you_better: {
                    label: t('dashboard.facts.4.title'),
                    type: 'radio',
                    required: true,
                    defaultValue: user?.data?.describe_you_better,
                    // placeholder: t('dashboard.facts.4.title'),
                    options: [
                      { label: t('dashboard.facts.4.options.structured'), value: 'structured' },
                      { label: t('dashboard.facts.4.options.free_spirited'), value: 'free_spirited' }
                    ],
                  },

                  describe_role_in_relationship: {
                    label: t('dashboard.facts.5.title'),
                    type: 'radio',
                    required: true,
                    defaultValue: user?.data?.describe_role_in_relationship,
                    // placeholder: t('dashboard.facts.5.title'),
                    options: [
                      { label: t('dashboard.facts.5.options.harmony'), value: 'harmony' },
                      { label: t('dashboard.facts.5.options.dominance'), value: 'dominance' }
                    ],
                  },
                  description: {
                    label: t('account.profile.profile.form.description.label'),
                    type: 'textarea',
                    rows: 4,
                    required: false,
                    value: user?.data?.description,
                  },
                  // ...user?.data?.permission === 'owner' && {
                  //   account_name: {
                  //     type: 'text',
                  //     label: t('account.profile.profile.form.account_name.label'),
                  //     value: user?.data?.account_name
                  //   }
                  // },
                  // ...user?.data?.accounts?.length > 1 && {
                  //   default_account: {
                  //     label: t('account.profile.profile.form.default_account.label'),
                  //     type: 'select',
                  //     defaultValue: user?.data?.default_account,
                  //     options: user?.data?.accounts.map(x => { return {

                  //       value: x.id, label: x.name

                  //     }})
                  //   }
                  // }
                }}
                callback={ res => {

                  const data = res.data.data;

                  setIsReload((prev) => (prev + 1))
                  setOpenProfile(false)
                  // update the account name
                  if (data.account_name && authContext.user?.accounts?.length > 0){

                    const accounts = [...authContext.user.accounts]
                    accounts[accounts.findIndex(x => x.id === authContext.user.account_id)].name = data.account_name;
                    authContext.update({ accounts: accounts })

                  }

                  // update the user name
                  if (data.first_name || data.last_name)
                    authContext.update({ name: `${data.first_name} ${data.last_name}` });

                  // update the avatar
                  if (data.avatar)
                    authContext.update({ avatar: data.avatar });
                  
                  // user changed email and needs to verify
                  if (data.hasOwnProperty('verified') && !data.verified){

                    authContext.update({ verified: false });
                    navigate('/signup/verify')

                  }
                }}
              />
            }
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== Change Password Modal ===== */}
      <Dialog open={openPassword} onOpenChange={setOpenPassword}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle> {t('account.profile.change_password')}</DialogTitle>
          </DialogHeader>
          <Form
            url='/api/user/password'
            method='PUT'
            buttonText={ t('account.password.form.button') }
            inputs={{
              ...authContext?.user?.has_password && { 
                oldpassword: {
                  label: t('account.password.form.old_password.label'),
                  type: 'password',
                  required: true
                },
                has_password: {
                  type: 'hidden',
                  value: true,
                }
              },
              newpassword: {
                label: t('account.password.form.new_password.label'),
                type: 'password',
                required: true,
                validation: { complex: true }
              },
            }}
            callback={ () => {
              
              setDone(true);
              authContext.update({ has_password: true });
              setOpenPassword(false);
              viewContext.notification({

                title: t('account.password.success_message.title'),
                description: t('account.password.success_message.text')

              });
            }}
          /> 
        </DialogContent>
      </Dialog>

      {/* ===== Gallery Modal ===== */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-3xl">
          <div className="relative h-[70vh] w-full overflow-hidden rounded-lg bg-black">
            <AnimatePresence initial={false} custom={activeIndex}>
              <motion.img
                key={activeIndex}
                src={photos[activeIndex]}
                alt="active"
                className="absolute inset-0 h-full w-full object-contain"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
            {photos.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20"
                  onClick={() =>
                    setActiveIndex((i) => (i - 1 + photos.length) % photos.length)
                  }
                >
                  ‹
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20"
                  onClick={() => setActiveIndex((i) => (i + 1) % photos.length)}
                >
                  ›
                </Button>
              </>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 bg-white/30"
              onClick={() => setGalleryOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ icon: Icon, label, value, className }) {
  return (
    <div className={`space-y-1 ${className || ""}`}>
      <p className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />} {label}
      </p>
      <p className="text-base font-semibold break-words leading-snug">{value}</p>
    </div>
  );
}