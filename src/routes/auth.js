import { Signup } from 'views/auth/signup/account';
import { Payment } from 'views/auth/signup/payment';
import { SignupUser } from 'views/auth/signup/user';
import { SignupVerification } from 'views/auth/signup/verify';
import { Signin } from 'views/auth/signin';
import { SigninOTP } from 'views/auth/signin/otp';
import { SocialSignin } from 'views/auth/signin/social';
import { ForgotPassword } from 'views/auth/signin/forgotpassword';
import { ResetPassword } from 'views/auth/signin/resetpassword';
import { MagicSignin } from 'views/auth/signin/magic';
import { ImpersonateSignin } from 'views/auth/signin/impersonate';

const Routes = [
  {
    path: '/',
    view: Signin,
    layout: 'auth',
    title: 'auth.signin.index.title'
  },
  {
    path: '/signup',
    view: Signup,
    layout: 'auth',
    title: 'auth.signup.account.title'
  },
  { 
    path: '/signup/verify',
    view: SignupVerification,
    layout: 'auth',
    // permission: 'user',
    title: 'auth.signup.verify.title'
  },
  {
    path: '/signup/user',
    view: SignupUser,
    layout: 'auth',
    title: 'auth.signup.user.title'
  },
  {
    path: '/signup/:id',
    view: Payment,
    layout: 'auth',
    permission: 'owner',
    title: 'auth.signup.payment.title'
  },
  {
    path: '/signin',
    view: Signin,
    layout: 'auth',
    title: 'auth.signin.index.title'
  },
  {
    path: '/signin/otp',
    view: SigninOTP,
    layout: 'auth',
    title: 'Enter verification code'
  },
  {
    path: '/signin/social',
    view: SocialSignin,
    layout: 'auth',
    title: 'auth.signin.social.title'
  },
  {
    path: '/magic',
    view: MagicSignin,
    layout: 'auth',
    title: 'auth.signin.magic.title'
  },
  {
    path: '/forgotpassword',
    view: ForgotPassword,
    layout: 'auth',
    title: 'auth.signin.forgotpassword.title'
  },
  {
    path: '/resetpassword',
    view: ResetPassword,
    layout: 'auth',
    title: 'auth.signin.resetpassword.title'
  },
  {
    path: '/signin/impersonate',
    view: ImpersonateSignin,
    layout: 'auth',
    title: 'auth.signin.impersonate.title'
  },
]

export default Routes;