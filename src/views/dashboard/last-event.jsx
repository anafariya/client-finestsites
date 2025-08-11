import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from 'components/shadcn/card'
import { useTranslation } from 'react-i18next'

const LastEventsTable = ({ events = [] }) => {
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        >
        <Card className="overflow-hidden rounded-2xl shadow-md border border-gray-200">
            <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{t('dashboard.last_5')}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="bg-gradient-to-r from-cyan-50 to-white text-gray-600 uppercase text-xs tracking-wider">
                    <th className="px-4 py-2 rounded-l-lg">{t('dashboard.event')}</th>
                    <th className="px-4 py-2">{t('dashboard.date')}</th>
                    <th className="px-4 py-2 rounded-r-lg">{t('dashboard.location')}</th>
                    </tr>
                </thead>
                <tbody>
                    {events.length > 0 ? (
                    events.map((event, index) => (
                        <motion.tr
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white shadow-sm rounded-lg transition duration-200"
                        >
                        <td className="px-4 py-3 rounded-l-lg text-gray-800">{event.event?.city?.name}</td>
                        <td className="px-4 py-3 text-gray-600">{event.event?.date && formatDateString(event.event?.date)}</td>
                        <td className="px-4 py-3 rounded-r-lg text-gray-600">{event.group?.bar?.name}</td>
                        </motion.tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan="3" className="px-4 py-4 text-center text-gray-400 italic">
                        {t('dashboard.no_data')}
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            </CardContent>
        </Card>
        </motion.div>
    )
}

export default LastEventsTable
