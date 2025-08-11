import Axios from 'axios';
import i18n from 'i18next';

// components
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, AuthProvider } from './auth';
import { UserSwiperProvider } from './user-swiper'
import { View } from 'components/lib';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { initReactI18next } from 'react-i18next';

// routes
import SetupRoutes from 'routes/setup';
import AccountRoutes from 'routes/account';
import AppRoutes from 'routes/app';
import AuthRoutes from 'routes/auth';

// locales
import English from 'locales/en/index';
import Germany from 'locales/de/index'

// views
import { NotFound } from 'views/error/404';

// tailwind css
import '../css/output.css';

// settings
import Settings from 'settings.json';
const StripePromise = loadStripe(Settings[process.env.NODE_ENV].stripe.publishableAPIKey);

const routes = [

  ...SetupRoutes,
  ...AccountRoutes, 
  ...AppRoutes,
  ...AuthRoutes,

]

export default function App(props){

  const user = JSON.parse(localStorage.getItem('user'));
  Axios.defaults.baseURL = Settings[process.env.NODE_ENV].server_url;
  
  // Determine the language to use - Force English for new users
  let defaultLanguage = 'en';
  
  // For debugging - log the current state
  console.log('Current user:', user);
  console.log('Browser language:', navigator.language);
  
  // If no user is logged in, always use English for signup
  if (!user) {
    defaultLanguage = 'en'; // Force English for signup
    console.log('No user found, forcing English language');
    // Set Accept-Language header to English for new users
    Axios.defaults.headers.common['Accept-Language'] = 'en';
  }
  
  if (user){
    if (user.token){
  
      // add auth token to api header calls
      Axios.defaults.headers.common['Authorization'] = 'Bearer ' + user.token;
      Axios.defaults.headers.common['Accept-Language'] = user.locale;

    }
  
    // set the color mode
    user.dark_mode ?
      document.getElementById('app').classList.add('dark') :
      document.getElementById('app').classList.remove('dark');

  }

  // config locale/language
  i18n.use(initReactI18next).init({

    resources: {
      en: English,
      de: Germany
    },
    lng: user?.locale || defaultLanguage, // Use user locale or force English
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });
  
  console.log('i18n language set to:', user?.locale || defaultLanguage);

  // render the routes
  return(
    <Elements stripe={ StripePromise }>
      <AuthProvider>
        <UserSwiperProvider>
          <BrowserRouter>
            <Routes>
              { routes.map(route => {

                return (
                  <Route 
                    key={ route.path } 
                    path={ route.path }
                    element={ 
                      
                      route.permission ? 
                      
                        <PrivateRoute { ...route }>
                          <View { ...route }/>
                        </PrivateRoute> :
                        
                        <View {...route }/>

                    }
                  />
                )
              })}

              { /* 404 */}
              <Route path='*' element={ <View view={ NotFound } layout='auth' title='404 Not Found' /> }/>

            </Routes>
          </BrowserRouter>
        </UserSwiperProvider>
      </AuthProvider>
    </Elements>
  );
}
