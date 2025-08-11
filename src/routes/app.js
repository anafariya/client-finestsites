import { Dashboard } from 'views/dashboard/dashboard';
import { Help } from 'views/dashboard/help';
import { Inbox } from 'views/inbox/inbox';
import { InboxDetail } from 'views/inbox/inbox-detail';
import Matches from 'views/matches/matches';
import { OnboardingView } from 'views/onboarding/onboarding';
import Profile from 'views/profile/profile';
import MatchingRoom from 'views/matching-room/matching-room';
import Event from 'views/matching-room/event/event';
import { Payment } from 'views/auth/signup/payment';
import { Payment as EventPayment } from 'views/dashboard/payment';

const Routes = [
  {
    path: '/dashboard',
    view: Dashboard,
    layout: 'app',
    permission: 'user',
    title: 'dashboard.title'
  },
  {
    path: '/welcome',
    view: OnboardingView,
    layout: 'onboarding',
    permission: 'user',
    title: 'onboarding.title'
  },
  {
    path: '/help',
    view: Help,
    layout: 'app',
    permission: 'user',
    title: 'help.title'
  },
  {
    path: '/inbox',
    view: Inbox,
    layout: 'app',
    permission: 'user',
    title: 'inbox.title'
  },
  {
    path: '/inbox/:id',
    view: InboxDetail,
    layout: 'app',
    permission: 'user',
    title: 'inbox.title'
  },
  {
    path: '/matches',
    view: Matches,
    layout: 'app',
    permission: 'user',
    title: 'matches.title'
  },
  {
    path: '/matching-room',
    view: MatchingRoom,
    layout: 'app',
    permission: 'user',
    title: 'matching_room.title'
  },
  {
    path: '/matching-room/:id',
    view: Event,
    layout: 'app',
    permission: 'user',
    title: 'matching_room.title'
  },
  {
    path: '/profile/:id',
    view: Profile,
    layout: 'app',
    permission: 'user',
    title: 'profile_user.title'
  },
  {
    path: '/payment/:id',
    view: Payment,
    layout: 'app',
    permission: 'user',
    title: 'auth.signup.payment.title'
  },
  {
    path: '/event/:id',
    view: EventPayment,
    layout: 'app',
    permission: 'user',
    title: 'auth.signup.payment.title'
  },
]

export default Routes;
