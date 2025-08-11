/***
*
*   VERTICAL NAV
*   Primary desktop navigation used inside the main app.
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
import { Logo, Button, Icon, Tooltip, TooltipTrigger, TooltipContent, cn, SidebarProfileCard, AuthContext } from 'components/lib';

export function VerticalNav({ items }){
  const authContext = useContext(AuthContext);
  
  function renderItem(item){    

    return (
      // <Tooltip key={ item.label }>
      //   <TooltipTrigger asChild>

          <div>
          { item.link ? 
          
            <NavLink to={ item.link } 
              className={({ isActive }) => cn('flex h-9 w-9 items-center gap-2 rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-full p-2', { ['bg-accent dark:bg-transparent dark:bg-primary dark:bg-opacity-30']: isActive })}>
                <Icon name={ item.icon } size={ 18 } /> {item.label} {(item.link.includes('/inbox') && authContext?.unreadCount) ? <span><span className="font-bold text-green-500">
                ({authContext?.unreadCount})
                </span></span> : null}
            </NavLink> :
            <SidebarProfileCard user={{
              id: '',
              first_name:  authContext?.user?.name,
              photos: [],
              coins: authContext?.user?.accounts?.[0]?.virtual_currency
            }} />
            // <Button variant='icon'  icon={ item.icon } action={ item.action }/> 
          }
          </div>

      //   </TooltipTrigger>
      //   <TooltipContent side='right'>{ item.label }</TooltipContent>
      // </Tooltip>
    )
  }

  return (
    <aside className='fixed pt-4 bg-white inset-y-0 left-0 z-10 hidden w-[200px] flex-col border-r bg-background sm:flex dark:bg-slate-900 dark:border-r-slate-800'>

      <Logo mark className='w-6 h-6 mb-4' color='dark'/>

      { /* top items */ }
      <nav className='flex flex-col gap-3 px-2 sm:py-5'>
        { items?.length > 0 &&
          items.map(item => {

            return item.position === 'top' ? renderItem(item) : false;
            
          })
        }
      </nav>

      { /* bottom items */ }
      <nav className={ cn('flex flex-col gap-3 px-2 sm:py-5', 'mt-auto') }>
        { items?.length > 0 &&
          items.map(item => {

            return item.position === 'bottom' ? renderItem(item) : false;
            
          })
        }
      </nav>
    </aside>
  )
}
