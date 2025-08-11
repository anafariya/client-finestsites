import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from 'components/shadcn/card'
import { Button } from 'components/shadcn/button'
import { Badge } from 'components/shadcn/badge'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const UpcomingEvent = ({ event, friends }) => {
    const { t } = useTranslation()
    const router = useNavigate()
    if (!event) return null

    function formatDateString(d){
        const formatter = new Intl.DateTimeFormat('de-DE', {
            timeZone: 'Europe/Berlin',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formatter.format(new Date(d));

    }

    const { tagline, title, date, start_time, end_time, image } = event;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full"
        >
            <Card className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 h-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 h-full">
                {/* Image */}
                <div className="h-48 sm:h-auto">
                    <img
                    src={image || '/assets/images/location.png'}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>

                {/* Content */}
                <CardContent className="flex flex-col justify-between gap-4 p-6">
                    <div className="space-y-1">
                    <Badge variant="outline" className="text-xs text-white bg-pink-500 border-pink tracking-wide uppercase">
                        {tagline}
                    </Badge>
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    {/* <p className="text-sm text-gray-600">{description}</p> */}

                    <div className="text-sm text-gray-600 space-y-1 pt-2">
                        <p>📅 &nbsp; <span className="font-medium">{date && formatDateString(date)}</span></p>
                        <p>⏰ &nbsp; <span className="font-medium">{start_time} - {end_time}</span></p>
                        {/* <p>🎯 &nbsp; {t('dashboard.age_group')}: <span className="font-medium">{ageGroup}</span></p> */}
                        <p>
                        👥 &nbsp;{friends?.length ? (
                            <span className="font-medium">{t('dashboard.with')} {(friends.map(friend => friend.first_name ? `${friend.first_name} ${friend.last_name}` : friend.name)).join(', ')}</span>
                        ) : (
                            <span className="italic">{t('dashboard.registered_alone')}</span>
                        )}
                        </p>
                    </div>
                    </div>

                    {/* <Button
                        variant="outline"
                        className="w-full hover:bg-cyan-50 hover:text-cyan-600 transition"
                        onClick={() => router(`/matching-room/${event._id}`)}
                    >
                    {t('dashboard.view_details')}
                    </Button> */}
                </CardContent>
                </div>
            </Card>
        </motion.div>
    )
}

export default UpcomingEvent
