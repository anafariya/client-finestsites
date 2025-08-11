import React from 'react';
import EventCard from './event-card';
import { useNavigate } from 'components/lib';
import { ViewContext, useAPI, AuthContext } from 'components/lib';

const EventsGrid = () => {
    let navigate = useNavigate();
    const events = useAPI('/api/events/matching');
    const [refreshTrigger, setRefreshTrigger] = React.useState(false);
    const userRegistrations = useAPI('/api/user/registrations', 'get', refreshTrigger);
    
    // Debug logging
    React.useEffect(() => {
        if (userRegistrations?.data) {
            console.log('🔍 USER REGISTRATIONS:', userRegistrations.data);
        }
        if (events?.data) {
            console.log('🔍 EVENTS:', events.data);
        }
    }, [userRegistrations?.data, events?.data]);
    
    const handleClick = (event) => {
        navigate(`/matching-room/${event._id}`)
    };

    // Create a map of event IDs to registration data for quick lookup
    const registrationMap = React.useMemo(() => {
        if (!userRegistrations?.data) return {};
        const map = {};
        userRegistrations.data.forEach(reg => {
            // Handle both cases: event_id as object or string
            let eventId;
            if (reg.event_id && typeof reg.event_id === 'object' && reg.event_id._id) {
                eventId = reg.event_id._id;
            } else if (reg.event_id) {
                eventId = reg.event_id;
            } else {
                console.warn('Registration missing event_id:', reg);
                return; // Skip this registration
            }
            map[eventId] = reg;
        });
        return map;
    }, [userRegistrations?.data]);

    // Handle loading states
    if (events?.loading || userRegistrations?.loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading events...</div>
            </div>
        );
    }

    // Handle error states
    if (events?.error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500">Error loading events: {events.error}</div>
            </div>
        );
    }

    return (
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 p-4 lg:py-6 lg:px-10">
        {events?.data?.map((event) => {
            if (!event || !event._id) {
                console.warn('Event missing _id:', event);
                return null;
            }
            
            const userRegistration = registrationMap[event._id];
            return (
                <EventCard 
                    key={event._id || event.id} 
                    event={event} 
                    userRegistration={userRegistration}
                    onClick={() => handleClick(event)}
                    onRegistrationUpdate={() => setRefreshTrigger(prev => !prev)}
                />
            );
        })}
        </div>
    );
};

export default EventsGrid;
