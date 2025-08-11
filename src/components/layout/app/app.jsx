/***
*
*   APP LAYOUT
*   Main app layout containing the navigation and header.
*
*   DOCS
*   https://docs.usegravity.app/gravity-web/components/layout
*
*   PROPS
*   children: will be passed from router > view > here (component(s), required)
*   title: title of the view for the header (string, required)
*
**********/

import { Fragment, useContext } from 'react';
import { AuthContext, VerticalNav, DrawerNav, Header, User, useTranslation } from 'components/lib';
import { InboxLists } from 'views/inbox/inbox-lists';

export function AppLayout({ title, children, path }){

  // context & style
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);

  const nav = [
    { label: t('nav.dashboard'), icon: 'gauge', link: '/dashboard', position: 'top' },
    { label: t('nav.inbox'), icon: 'message-circle-more', link: '/inbox', position: 'top' },
    { label: t('nav.matches'), icon: 'heart', link: '/matches', position: 'top' },
    { label: t('nav.matching_room'), icon: 'door-open', link: '/matching-room', position: 'top' },
    // { label: t('nav.help'), icon: 'help-circle', link: '/help', position: 'bottom' },
    { label: t('nav.signout'), icon: 'log-out', action: authContext.signout, position: 'bottom' }
  ]
  
  return (
    <Fragment>

      <VerticalNav items={ nav }/>
      <DrawerNav items={ nav }/>

      <main className='p-4 pt-20 min-h-screen sm:pl-[12rem] sm:pr-0 sm:pb-0 sm:pt-0 dark:bg-slate-900'>

        {/* <Header title={ title === 'dashboard.title' ? `${t('nav.welcome')} ${authContext.user.name}` : t(title) }>
          <User />
        </Header> */}

        { 
          path.includes('/inbox') ? <div className="grid grid-cols-1 lg:grid-cols-3 w-full min-h-screen overflow-hidden">
            <InboxLists />
            {
              children
            }
          </div> :
          children
        }

      </main>
    </Fragment>
  );
}