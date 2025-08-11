'use client'

import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'components/shadcn/dialog'
import UpcomingEventCard from './upcoming-event-card'
import DynamicBookingForm from './form'
import { useTranslation } from 'react-i18next'
import { cn } from 'utils/cn'
import { useAPI, useNavigate, ViewContext } from 'components/lib'
import axios from 'axios'

export const UpcomingEventsTable = ({ events, isOnboarding }) => {
    const { t } = useTranslation()
    const [selectedEvent, setSelectedEvent] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const genders = [
        {label: t('dashboard.genders.male'), value: 'male'}, 
        {label: t('dashboard.genders.female'), value: 'female'}
    ];
    const lookingFor = [
        { value: 'male', label: t('account.profile.profile.gender.male') },
        { value: 'female', label: t('account.profile.profile.gender.female') },
        { value: 'both', label: t('account.profile.profile.gender.both') }
    ];
    const relationshipGoals = [
        { value: 'relationship', label: t('account.profile.profile.relationship_goal.relationship') },
        { value: 'friendship', label: t('account.profile.profile.relationship_goal.friendship') }
    ];
    const hasChildren = [
        { value: 'Yes', label: t('account.profile.profile.children.yes') },
        { value: 'No', label: t('account.profile.profile.children.no') }
    ]
    const [eventData, setEventData] = useState(events)
    const user = useAPI('/api/user')
    const navigate = useNavigate()
    const viewContext = useContext(ViewContext);

    // Booking form state
    const [mainUser, setMainUser] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        password: '',
        looking_for: '',
        relationship_goal: '',
        children: '',
        kind_of_person: '',
        feel_around_new_people: '',
        prefer_spending_time: '',
        describe_you_better: '',
        describe_role_in_relationship: '',
    })

    const [friend, setFriend] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        email: '',
        looking_for: '',
        relationship_goal: '',
        children: '',
        kind_of_person: '',
        feel_around_new_people: '',
        prefer_spending_time: '',
        describe_you_better: '',
        describe_role_in_relationship: '',
    })

    const [addFriend, setAddFriend] = useState(false)
    const [submiting, setSubmiting] = useState(false);

    const openModal = (event) => {
        setSelectedEvent(event)
        setIsModalOpen(true)
    }

    const closeModal = (e) => {
        e?.preventDefault();
        setIsModalOpen(false)
        setSelectedEvent(null)
        setFriend({ first_name: '', last_name: '', date_of_birth: '', gender: '', email: '', looking_for: '',
        relationship_goal: '',
        children: '',
        kind_of_person: '',
        feel_around_new_people: '',
        prefer_spending_time: '',
        describe_you_better: '',
        describe_role_in_relationship: '', })
        setAddFriend(false)
    }

    const handleSubmit = async () => {

        setSubmiting(true);
        try {
        const { data: submitted } = await axios.post("/api/events/register", {
            mainUser,
            friend,
            id: selectedEvent._id
        });

        if (submitted) {

            // authContext?.refreshUser?.();
            navigate(`/${isOnboarding ? 'signup' : 'event'}/${submitted.data.id}`)
        }
        } catch (err) {
             // Check if event is full
            console.log(err)
            if (err.response?.data?.error) {
                viewContext.notification({
                    description: err.response.data.error,
                    variant: 'error'
                });
            } else {
                // Use the project's error handling system for other errors
                viewContext.handleError(err);
            }
        } finally {
            setSubmiting(false);
            // closeModal()
        }
    }

    useEffect(() => {
        function init(){
            setEventData(events)
        }

        const timer = setTimeout(() => {
            init()
        }, 20);

        return () => clearTimeout(timer)
    }, [events])

    useEffect(() => {
        function init() {
            setMainUser({
                first_name: user?.data?.first_name,
                last_name: user?.data?.last_name,
                date_of_birth: user?.data?.date_of_birth,
                gender: user?.data?.gender,
                email: user?.data?.email,
                looking_for: user?.data?.looking_for,
                relationship_goal: user?.data?.relationship_goal,
                children: user?.data?.children ? 'Yes' : 'No',
                kind_of_person: user?.data?.kind_of_person,
                feel_around_new_people: user?.data?.feel_around_new_people,
                prefer_spending_time: user?.data?.prefer_spending_time,
                describe_you_better: user?.data?.describe_you_better,
                describe_role_in_relationship: user?.data?.describe_role_in_relationship,
            })
        }
        const timer = setTimeout(() => {
            init()
        }, 30);
        return () => clearTimeout(timer)
    }, [user])

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {!isOnboarding && <h1 className="text-2xl font-bold">{t('dashboard.upcoming_events')}</h1>}
                
                <div className={cn("grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:py-6", isOnboarding && 'lg:grid-cols-2')}>
                    {eventData?.length > 0 ? (
                    eventData.map((event, i) => (
                        <UpcomingEventCard key={i} event={event} onClick={() => {
                            openModal(event)
                        }} isOnboarding={isOnboarding} />
                    ))
                    ) : (
                    <p className="text-center text-gray-400 italic col-span-full">{t('dashboard.no_upcoming_events')}</p>
                    )}
                </div>
            </motion.div>

            {/* Register Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-3xl bg-white">
                    <DialogHeader>
                        <DialogTitle>{t('dashboard.book_event')}: {selectedEvent?.tagline}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                        <DynamicBookingForm
                            handleSubmit={handleSubmit}
                            mainUser={mainUser}
                            setMainUser={setMainUser}
                            friend={friend}
                            setFriend={setFriend}
                            addFriend={addFriend}
                            setAddFriend={setAddFriend}
                            genders={genders}
                            closeModal={closeModal}
                            lookingFor={lookingFor}
                            relationshipGoals={relationshipGoals}
                            hasChildren={hasChildren}
                        />
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}    