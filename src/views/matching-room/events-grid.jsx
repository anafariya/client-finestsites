import React, { useContext } from 'react';
import EventCard from './event-card';
import { useNavigate, ViewContext, useAPI, AuthContext, useTranslation } from 'components/lib';

const EventsGrid = () => {
    let navigate = useNavigate();
    const viewContext = useContext(ViewContext);
    const { t } = useTranslation();
    const events = useAPI('/api/events/matching');
    
    const handleClick = (event) => {
        navigate(`/matching-room/${event._id}`)
    };

    const handleCancel = (event) => {
        viewContext.dialog.open({
            title: t('matching_room.cancel_registration.form.title'),
            description: t('matching_room.cancel_registration.form.description'),
            form: {
                inputs: {
                    eventId: {
                        type: 'hidden',
                        value: event._id
                    }
                },
                buttonText: t('matching_room.cancel_registration.form.button'),
                url: '/api/events/cancel-registration',
                method: 'POST',
                destructive: false
            }
        }, () => {
            // Refresh events list after successful cancellation
            window.location.reload();
        });
    };

    const handleSearch = () => {
        navigate('/dashboard');
    };

    // Show loading state while fetching events
    if (events.loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Show empty state with search button when no events
    if (!events?.data || events.data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 lg:p-16 text-center">
                <div className="mb-6">
                    <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('matching_room.no_events.title', 'Keine registrierten Events')}
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                    {t('matching_room.no_events.description', 'Du hast noch keine Events registriert. Entdecke spannende Events in deiner Nähe!')}
                </p>
                <button
                    onClick={handleSearch}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors duration-200"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {t('matching_room.no_events.search_button', 'Suchen')}
                </button>
            </div>
        );
    }

    return (
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 p-4 lg:py-6 lg:px-10">
        {events?.data?.map((event) => (
            <EventCard 
                key={event.id} 
                event={event} 
                onClick={() => handleClick(event)}
                onCancel={handleCancel}
            />
        ))}
        </div>
    );
};

export default EventsGrid;
