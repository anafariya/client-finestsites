import React, { useState } from 'react';
import { Input } from 'components/shadcn/input';
import { Button } from 'components/shadcn/button';
import { RadioGroup, RadioGroupItem } from 'components/shadcn/radio-group';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from 'components/shadcn/select';
import { DialogFooter } from 'components/shadcn/dialog';
import { Label } from 'components/shadcn/label';
import { useTranslation } from 'react-i18next';
import { DateInput } from 'components/lib';

const DynamicBookingForm = ({
  mainUser,
  setMainUser,
  friend,
  setFriend,
  addFriend,
  setAddFriend,
  genders,
  handleSubmit,
  closeModal,
  lookingFor,
  relationshipGoals,
  hasChildren
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const mainUserFields = [
    { label: t('dashboard.fields.user.first_name'), name: 'first_name', type: 'text', required: true, disabled: true },
    { label: t('dashboard.fields.user.last_name'), name: 'last_name', type: 'text', required: true, disabled: true },
    { label: t('dashboard.fields.user.date_of_birth'), name: 'date_of_birth', type: 'date', required: true, disabled: true },
    { label: t('dashboard.fields.user.gender'), name: 'gender', type: 'select', required: true },
    { label: t('dashboard.fields.user.email'), name: 'email', type: 'email', required: true, disabled: true },
    { label: t('dashboard.fields.user.looking_for'), name: 'looking_for', type: 'select', required: true },
    { label: t('dashboard.fields.user.relationship_goal'), name: 'relationship_goal', type: 'select', required: true},
    { label: t('dashboard.fields.user.children'), name: 'children', type: 'select', required: true },
    { label: t('dashboard.facts.1.title'), name: 'kind_of_person', type: 'radio', required: true, options: [
      { label: t('dashboard.facts.1.options.similar'), value: 'similar' },
      { label: t('dashboard.facts.1.options.opposite'), value: 'opposite' }
    ] },
    { label: t('dashboard.facts.4.title'), name: 'describe_you_better', type: 'radio', required: true, options: [
      { label: t('dashboard.facts.4.options.structured'), value: 'structured' },
      { label: t('dashboard.facts.4.options.free_spirited'), value: 'free_spirited' }
    ] },
    { label: t('dashboard.facts.2.title'), name: 'feel_around_new_people', type: 'radio', required: true, options: [
      { label: t('dashboard.facts.2.options.introvert'), value: 'introvert' },
      { label: t('dashboard.facts.2.options.extrovert'), value: 'extrovert' },
      { label: t('dashboard.facts.2.options.ambivert'), value: 'ambivert' }
    ] },
    { label: t('dashboard.facts.3.title'), name: 'prefer_spending_time', type: 'radio', required: true, options: [
      { label: t('dashboard.facts.3.options.closeness_seeker'), value: 'closeness_seeker' },
      { label: t('dashboard.facts.3.options.activity_seeker'), value: 'activity_seeker' },
      { label: t('dashboard.facts.3.options.both_seeker'), value: 'both_seeker' }
    ] },
    
    { label: t('dashboard.facts.5.title'), name: 'describe_role_in_relationship', type: 'radio', required: true, options: [
      { label: t('dashboard.facts.5.options.harmony'), value: 'harmony' },
      { label: t('dashboard.facts.5.options.dominance'), value: 'dominance' }
    ] },
  ];

  const friendFields = [
    { label: t('dashboard.fields.friend.first_name'), name: 'first_name', type: 'text', required: true },
    { label: t('dashboard.fields.friend.last_name'), name: 'last_name', type: 'text', required: true },
    { label: t('dashboard.fields.friend.date_of_birth'), name: 'date_of_birth', type: 'date', required: true },
    { label: t('dashboard.fields.friend.gender'), name: 'gender', type: 'select', required: true },
    { label: t('dashboard.fields.friend.email'), name: 'email', type: 'email', required: false },
    { label: t('dashboard.fields.friend.looking_for'), name: 'looking_for', type: 'select', required: true },
    { label: t('dashboard.fields.friend.relationship_goal'), name: 'relationship_goal', type: 'select', required: true},
    { label: t('dashboard.fields.friend.children'), name: 'children', type: 'select', required: true },
    { label: t('dashboard.friend_facts.1.title'), name: 'kind_of_person', type: 'radio', required: true, options: [
      { label: t('dashboard.friend_facts.1.options.similar'), value: 'similar' },
      { label: t('dashboard.friend_facts.1.options.opposite'), value: 'opposite' }
    ] },
    { label: t('dashboard.friend_facts.4.title'), name: 'describe_you_better', type: 'radio', required: true, options: [
      { label: t('dashboard.friend_facts.4.options.structured'), value: 'structured' },
      { label: t('dashboard.friend_facts.4.options.free_spirited'), value: 'free_spirited' }
    ] },
    { label: t('dashboard.friend_facts.2.title'), name: 'feel_around_new_people', type: 'radio', required: true, options: [
      { label: t('dashboard.friend_facts.2.options.introvert'), value: 'introvert' },
      { label: t('dashboard.friend_facts.2.options.extrovert'), value: 'extrovert' },
      { label: t('dashboard.friend_facts.2.options.ambivert'), value: 'ambivert' }
    ] },
    { label: t('dashboard.friend_facts.3.title'), name: 'prefer_spending_time', type: 'radio', required: true, options: [
      { label: t('dashboard.friend_facts.3.options.closeness_seeker'), value: 'closeness_seeker' },
      { label: t('dashboard.friend_facts.3.options.activity_seeker'), value: 'activity_seeker' },
      { label: t('dashboard.friend_facts.3.options.both_seeker'), value: 'both_seeker' }
    ] },
    
    { label: t('dashboard.friend_facts.5.title'), name: 'describe_role_in_relationship', type: 'radio', required: true, options: [
      { label: t('dashboard.friend_facts.5.options.harmony'), value: 'harmony' },
      { label: t('dashboard.friend_facts.5.options.dominance'), value: 'dominance' }
    ] },
  ];

  const [emailValid, setEmailValid] = useState(true);
  const [friendEmailValid, setFriendEmailValid] = useState(true);

  const isValidEmail = (email) =>
    typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleMainChange = (name, value, type) => {
    if (type === 'email') {
      setEmailValid(isValidEmail(value));
    }
    setMainUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleFriendChange = (name, value, type) => {
    if (type === 'email') {
      setFriendEmailValid(value === '' || isValidEmail(value)); // allow blank if not required
    }
    setFriend((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await handleSubmit(e);
    } finally {
      setLoading(false);
    }
  };

  const areRequiredFieldsFilled = (userData, fields) => {
    return fields.every(field => {
      if (!field.required) return true;

      const value = userData[field.name];

      if (field.type === 'radio' || field.type === 'select') {
        return value !== undefined && value !== null && value !== '';
      }

      if (field.type === 'email') {
        return value && isValidEmail(value);
      }

      return value && value.trim?.() !== '';
    });
  };

  const isMainUserValid = areRequiredFieldsFilled(mainUser, mainUserFields) && emailValid;
  const isFriendValid = !addFriend || (areRequiredFieldsFilled(friend, friendFields) && friendEmailValid);
  const isFormValid = isMainUserValid && isFriendValid;

  // Get missing fields for better UX
  const getMissingFields = (userData, fields) => {
    return fields
      .filter(field => field.required)
      .filter(field => {
        const value = userData[field.name];
        if (field.type === 'radio' || field.type === 'select') {
          return value === undefined || value === null || value === '';
        }
        if (field.type === 'email') {
          return !value || !isValidEmail(value);
        }
        return !value || value.trim?.() === '';
      })
      .map(field => field.label);
  };

  const missingMainFields = getMissingFields(mainUser, mainUserFields);
  const missingFriendFields = addFriend ? getMissingFields(friend, friendFields) : [];



  return (
    <div className="space-y-4 mt-4 max-h-[80vh] overflow-auto px-4">
      {/* Main User Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {mainUserFields.map((field) => (
          <InputGroup key={field.name} label={field.label} required={field.required}>
            {field.type === 'select' ? (
              <Select
                value={mainUser[field.name]}
                onValueChange={(val) => handleMainChange(field.name, val)}
                required={field.required}
                disabled={field.disabled}
              >
                <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(field.name === 'gender' ? genders : field.name === 'looking_for' ? lookingFor : field.name === 'children' ? (hasChildren) : relationshipGoals).map((g, i) => (
                      <SelectItem key={i} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : field.type === 'date' ? (
              <DateInput
                isEvent
                type={field.type}
                defaultValue={mainUser[field.name]}
                onChange={(e) => handleMainChange(field.name, e.value)}
                required={field.required}
                disabled={field.disabled}
              />
            ) : field.type === 'radio' ? (
              <RadioGroup defaultValue={mainUser[field.name]} className="my-2" onValueChange={(e) => handleMainChange(field.name, e)}>
                {
                  field.options.map((dt, i) => <div className="flex items-center gap-2" key={i}>
                  <RadioGroupItem value={dt.value} id={dt.value} />
                  <Label htmlFor={dt.value}>{dt.label}</Label>
                </div>)
                }
              </RadioGroup>
            ) : (
              <Input
                type={field.type}
                value={mainUser[field.name]}
                onChange={(e) => handleMainChange(field.name, e.target.value, field.type)}
                placeholder={field.label}
                required={field.required}
                disabled={field.disabled}
              />
            )}
          </InputGroup>
        ))}
      </div>

      {/* Toggle for Friend */}
      <div className="pt-2">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={addFriend}
            onChange={(e) => setAddFriend(e.target.checked)}
            className="mr-2 h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
          />
          <span className="text-gray-700">{t('dashboard.add_a_friend')}</span>
        </label>
      </div>

      {/* Friend Fields */}
      {addFriend && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border rounded-lg p-4 bg-cyan-50">
          {friendFields.map((field) => (
            <InputGroup key={field.name} label={field.label} required={field.required}>
              {field.type === 'select' ? (
                <Select
                value={friend[field.name]}
                onValueChange={(val) => handleFriendChange(field.name, val)}
                required={field.required}
                disabled={field.disabled}
              >
                <SelectTrigger><SelectValue placeholder={`Select ${field.label}`} /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {(field.name === 'gender' ? genders : field.name === 'looking_for' ? lookingFor : field.name === 'children' ? (hasChildren) : relationshipGoals).map((g, i) => (
                      <SelectItem key={i} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              ) : field.type === 'date' ? (
                <DateInput
                  isEvent
                  type={field.type}
                  defaultValue={friend[field.name]}
                  onChange={(e) => handleFriendChange(field.name, e.value)}
                  required={field.required}
                />
              ) : field.type === 'radio' ? (
                <RadioGroup defaultValue={friend[field.name]}  onValueChange={(e) => handleFriendChange(field.name, e)}>
                  {
                    field.options.map((dt, i) => <div className="flex items-center gap-3" key={i}>
                    <RadioGroupItem value={dt.value} id={`${dt.value}-sub`} />
                    <Label htmlFor={`${dt.value}-sub`}>{dt.label}</Label>
                  </div>)
                  }
                </RadioGroup>
              ) : (
                <Input
                  type={field.type}
                  value={friend[field.name]}
                  onChange={(e) => handleFriendChange(field.name, e.target.value, field.type)}
                  placeholder={field.label}
                  required={field.required}
                />
              )}
            </InputGroup>
          ))}
        </div>
      )}

      {/* Missing Fields Warning */}
      {!isFormValid && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Please complete the following required fields:</p>
              {missingMainFields.length > 0 && (
                <div className="mb-2">
                  <p className="font-medium text-xs">Your Information:</p>
                  <ul className="text-xs list-disc list-inside ml-2">
                    {missingMainFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
              {missingFriendFields.length > 0 && (
                <div>
                  <p className="font-medium text-xs">Friend's Information:</p>
                  <ul className="text-xs list-disc list-inside ml-2">
                    {missingFriendFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <DialogFooter className="flex flex-wrap sm:flex-nowrap gap-2">
        <Button
          type="button"
          onClick={loading ? (e) => (e.preventDefault()) : isFormValid && onSubmit}
          className={`w-full sm:w-auto flex items-center justify-center ${
            isFormValid 
              ? 'bg-cyan-600 hover:bg-cyan-700' 
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
              {t('dashboard.confirm_booking')}
            </span>
          ) : !isFormValid ? (
            <span className="flex items-center gap-2">
              <span>⚠️ {t('dashboard.complete_required_fields')}</span>
            </span>
          ) : (
            <>
              {t('dashboard.confirm_booking')} (€{20 * (addFriend ? 2 : 1)})
            </>
          )}
        </Button>
        <Button variant="ghost" onClick={closeModal} className="ml-2" disabled={loading}>
          {t('dashboard.cancel')}
        </Button>
      </DialogFooter>
    </div>
  );
};

export default DynamicBookingForm;


const InputGroup = ({ label, children, required = false }) => (
    <div>
      <Label className="block mb-1 font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
)