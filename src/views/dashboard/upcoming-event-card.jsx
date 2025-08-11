import React from 'react';
import { Button } from 'components/shadcn/button';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from 'utils/cn';

const UpcomingEventCard = ({ event, onClick, isOnboarding }) => {
  const { t } = useTranslation();
  function formatDateString(d){
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date(d));

  }
  return (
    <motion.div
      onClick={() => {
        if (!event.is_registered) onClick();
      }}
      className={cn("relative w-full rounded-3xl overflow-hidden shadow-xl cursor-pointer h-[400px] lg:h-[600px]", isOnboarding && 'h-[300px] lg:h-[400px]')}
      style={{
        backgroundImage: `url(${event.image || '/assets/images/location.png'})`,
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
            <div className="opacity-90">
              {formatDateString(event.date)} &nbsp;•&nbsp; {event.start_time} - {event.end_time}
              {/* Ages {event.ageGroup} */}
            </div>
            <motion.div whileTap={{ scale: event.is_registered ? 1 : 0.95 }}>
              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!event.is_registered) onClick();
                }}
                disabled={event.is_registered}
                className={cn(
                  "text-sm font-semibold px-4 py-1 transition-colors duration-300",
                  event.is_registered
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-pink-600 hover:bg-pink-700 text-white"
                )}
              >
                {event.is_registered ? t('matching_room.already_booked') : t('matching_room.book_now')}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UpcomingEventCard;
