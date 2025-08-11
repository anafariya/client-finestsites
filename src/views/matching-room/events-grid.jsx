import React from 'react';
import EventCard from './event-card';
import { useNavigate } from 'components/lib';
import { ViewContext, useAPI, AuthContext } from 'components/lib';

const EventsGrid = () => {
    let navigate = useNavigate();
    const events = useAPI('/api/events/matching');
    const handleClick = (event) => {
        navigate(`/matching-room/${event._id}`)
    };

    return (
        <div className="grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 p-4 lg:py-6 lg:px-10">
        {events?.data?.map((event) => (
            <EventCard key={event.id} event={event} onClick={() => handleClick(event)} />
        ))}
        </div>
    );
};

export default EventsGrid;
