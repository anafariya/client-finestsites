import { useState, useEffect, createContext } from 'react';
import axios from 'axios';
import { useAPI, Event } from 'components/lib';
import { Navigate } from 'react-router-dom';

export const UserSwiperContext = createContext();

export function UserSwiperProvider(props){
  const [activeUser, setActiveUser] = useState(null)

  return (
    <UserSwiperContext.Provider value={{

      activeUser,
      setActiveUser: (data) => setActiveUser(data)

    }}

    {...props} />
  );
}