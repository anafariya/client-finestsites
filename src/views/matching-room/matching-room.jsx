import { useTranslation } from 'react-i18next';
import EventsGrid from './events-grid';

function MatchingRoom() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-10">
      <h1 className="text-2xl font-bold text-center my-6">{t('matching_room.header')}</h1>
      <EventsGrid />
    </div>
  );
}

export default MatchingRoom