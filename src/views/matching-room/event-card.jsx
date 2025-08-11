import React from 'react';
import { Button } from 'components/shadcn/button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ViewContext } from 'components/lib';

const EventCard = ({ event, onClick, userRegistration, onRegistrationUpdate }) => {
  const { t } = useTranslation();
  const viewContext = React.useContext(ViewContext);
  function formatDateString(d){
    const formatter = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
    });
    return formatter.format(new Date(d));

  }

  function isOpenEvent(date) {
    const berlinNow = new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' });
    const today = new Date(berlinNow);
    today.setHours(0, 0, 0, 0); // today at 00:00 in Berlin time

    const eventDate = new Date(date);
    eventDate.setHours(23, 59, 0, 0); // normalize to 11:59

    const msPerDay = 1000 * 60 * 60 * 24;
    const daysDiff = (today.getTime() - eventDate.getTime()) / msPerDay;
    
    return today >= eventDate && daysDiff >= 0 && daysDiff < 28;
  }
  
  function formatTimeRemaining(hours) {
    if (hours < 0) {
      return 'Event has already passed';
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    } else {
      return `${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  }

  const isOpen = event?.date && isOpenEvent(event.date);
  const isUserRegistered = userRegistration && (userRegistration.status === 'registered' || userRegistration.status === 'process');

  const handleCancelRegistration = (e) => {
    e.stopPropagation();
    
    // Check if viewContext and dialog are available
    if (!viewContext || !viewContext.dialog) {
      console.error('❌ DIALOG CONTEXT ERROR: viewContext or dialog not available');
      alert('Error: Unable to show cancellation dialog. Please try refreshing the page.');
      return;
    }

    // Calculate time until event
    const eventDateTime = new Date(event.date);
    if (event.start_time) {
      const [hours, minutes] = event.start_time.split(':');
      eventDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } else {
      eventDateTime.setHours(18, 0, 0, 0); // Default to 6 PM
    }
    
    const now = new Date();
    const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Check if event is in the past
    if (hoursUntilEvent < 0) {
      console.log('❌ CANCELLATION BLOCKED: Event is in the past');
      viewContext.dialog.open({
        title: 'Event Already Completed',
        description: 'This event has already taken place. You cannot cancel registrations for past events.',
        buttonText: 'OK',
        url: '',
        method: 'GET'
      });
      return;
    }
    
    // Check if cancellation is allowed (more than 24 hours before event)
    if (hoursUntilEvent <= 24) {
      console.log('❌ CANCELLATION BLOCKED: Less than 24 hours until event');
      viewContext.dialog.open({
        title: 'Cancellation Not Allowed',
        description: `Sorry, you cannot cancel this event as it starts in less than 24 hours. The event begins in ${formatTimeRemaining(hoursUntilEvent)}.`,
        buttonText: 'OK',
        url: '',
        method: 'GET'
      });
      return;
    }
    
    viewContext.dialog.open({
      title: 'Cancel Event Registration',
      description: `Are you sure you want to cancel the event? You'll receive a voucher for a future event since you're cancelling more than 24 hours before the event starts.`,
      buttonText: 'Cancel Registration',
      method: 'PUT',
      url: `/api/event/cancel/${userRegistration._id}`,
      form: {
        // Add a hidden input to ensure the form submits properly
        confirm: {
          type: 'hidden',
          value: 'true'
        }
      },
      callback: (data, res) => {
        console.log('🔄 CANCELLATION CALLBACK: Dialog callback triggered');
        console.log('📋 Callback data:', data);
        console.log('📋 Callback response:', res);
        console.log('🔄 CANCELLATION CONFIRMED: Updating UI state after cancellation');
        
        // Show success notification
        viewContext.notification({
          description: 'Event registration cancelled successfully! You will receive a voucher for a future event.',
          variant: 'success'
        });
        
        // Update the UI state instead of refreshing the page
        if (onRegistrationUpdate) {
          onRegistrationUpdate();
        }
      }
    });
  };

  return (
    <motion.div
      onClick={onClick}
      className="relative w-full rounded-3xl overflow-hidden shadow-xl cursor-pointer h-[400px] lg:h-[600px]"
      style={{
        backgroundImage: `url(${event.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-6">
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-wide text-pink-400 font-bold bg-black/50 w-max p-2 rounded-lg">
            {event.tagline}
          </p>
          <h2 className="text-white text-2xl font-bold leading-snug">
            {event.city?.name}
          </h2>
        </motion.div>

        <motion.div
          className="mt-4 backdrop-blur-sm bg-white/10 rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p className="text-sm text-white/90 mb-3">{event.description}</p>
          <div className="flex justify-between items-center text-white text-sm">
            <div className="opacity-90" dangerouslySetInnerHTML={{ __html: `${event.date && formatDateString(event.date)} &nbsp; ${event.group?.age_group ? `•&nbsp; Ages ${event.group?.age_group}` : ''}` }}>
              
            </div>
            <motion.div whileTap={{ scale: 0.95 }} className="flex gap-2">
              {isOpen && !isUserRegistered && (
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                  className="text-sm font-semibold px-4 py-1 bg-pink-600 hover:bg-pink-700 text-white transition-colors duration-300"
                >
                  {t('matching_room.join_now')}
                </Button>
              )}
              {isUserRegistered && (
                <Button
                  variant="destructive"
                  onClick={handleCancelRegistration}
                  className="text-sm font-semibold px-4 py-1 bg-pink-600 hover:bg-pink-700 text-white transition-colors duration-300"
                >
                  Cancel
                </Button>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EventCard;
