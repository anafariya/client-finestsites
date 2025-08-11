/***
*
*   DASHBOARD
*   Template dashboard example demonstrating various components inside a view.
*
**********/

import { useContext, useEffect } from 'react';
import { ViewContext, Card, Stat, Chart, Table, Grid, Row, Animate, Feedback, useAPI, AuthContext } from 'components/lib';
import UpcomingEvent from './upcoming';
import LastEventsTable from './last-event';
import { UpcomingEventsTable } from './upcoming-event';

export function Dashboard({ t }){

  // context
  const viewContext = useContext(ViewContext);
  const authContext = useContext(AuthContext);
  const events = useAPI('/api/events');

  const upcomingPastEvents = useAPI('/api/events/dashboard');

  // show welcome message
  useEffect(() => {
    viewContext.notification({ 
      
      title: t('dashboard.message.title'),
      description: t('dashboard.message.text'),
    
    });
  }, []);

  // fetch
  const res = useAPI('/api/demo');
  return (
    <Animate type='pop'>
      <div className="space-y-6 p-4 lg:p-14">
        <h1 className="text-2xl font-bold">{t('dashboard.welcome_back')}, {authContext?.user?.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UpcomingEvent event={upcomingPastEvents?.data?.upcoming?.event} friends={upcomingPastEvents?.data?.upcoming?.invited_friends} />
          <LastEventsTable events={upcomingPastEvents?.data?.past} />
        </div>
        
        <UpcomingEventsTable t={t} events={events?.data} />
      </div>

    </Animate>
  );
}
