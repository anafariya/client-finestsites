/***
*
*   DRAWER NAV
*   Primary mobile navigation used inside the main app.
*
*   DOCS
*   https://docs.usegravity.app/gravity-web/components/nav
*
*   PROPS
*   items:[{ label: string, link: string, icon: string }] (array, required)
*
**********/

import React, { useContext } from "react";
import { NavLink } from 'react-router-dom';
import { Sheet, SheetClose, Button, Icon, Logo, cn, SidebarProfileCard, AuthContext } from 'components/lib';

export function DrawerNav({ items }){
  const authContext = useContext(AuthContext);

  const Trigger = <Button size='icon' variant='ghost' iconSize={ 22 } icon='menu' className='fixed top-[0.7em] z-50 left-2 sm:hidden'/>

  return (
    <Sheet side='left' trigger={ Trigger } accessibleTitle='Menu'>

      <Logo mark className='inline-block h-8 w-8 mb-6' color='dark'/>

      <nav className='flex flex-col text-lg font-medium gap-y-3 pl-[5px] sm:hidden'>
        { items.length && 
          items.map(item => {

            return (
              <div className='[&>a]:flex [&>a]:items-center [&>a]:gap-x-3 text-muted-foreground hover:text-foreground dark:text-slate-50' key={ item.label }>

                { item.link ?
                  <SheetClose asChild>
                    <NavLink 
                      key={ item.label } 
                      to={ item.link } 
                      className={({ isActive }) => cn('[&>a]:flex [&>a]:items-center [&>a]:gap-x-3 text-muted-foreground hover:text-foreground dark:text-slate-50', { ['text-slate-900']: isActive })}>

                        <Icon name={ item.icon } size={ 18 } className={ `relative -top-[1px] text-${item.color}` }/>
                        <span>{ item.label }</span> &nbsp; {(item.link.includes('/inbox') && authContext?.unreadCount) ? <span><span className="font-bold text-green-500">
                        ({authContext?.unreadCount})
                        </span></span> : null}

                    </NavLink>
                  </SheetClose> :
                  <></>
                  // <Button 
                  //   key={ item.label } 
                  //   text={ item.label }
                  //   action={ item.action }  
                  //   icon={ item.icon }
                  //   color='primary'
                  //   iconColor='white'
                  //   size='full'
                  // /> 
                }

              </div> 
            )
          }) 
        }
      </nav>
      <div className="mt-auto absolute bottom-4 w-[85%]">
        <SidebarProfileCard
          user={{
            id: '',
            first_name:  authContext?.user?.name,
            photos: [],
            coins: authContext?.user?.accounts?.[0]?.virtual_currency
          }}
        />
      </div>
    </Sheet>
  )
}