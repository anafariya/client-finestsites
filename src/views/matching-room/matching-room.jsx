import { useTranslation } from 'react-i18next';
import { useNavigate, AuthContext } from 'components/lib';
import { useContext } from 'react';
import EventsGrid from './events-grid';

function MatchingRoom() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const handleSearchClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Hey <span className="text-pink-600">{user?.name || 'there'}</span>, verpasse diese Events nicht!</h1>
      <button 
        onClick={handleSearchClick}
        className="bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors mb-8 mx-auto block"
      >
        Suchen
      </button>
      <EventsGrid />
    </div>
  );
}

export default MatchingRoom