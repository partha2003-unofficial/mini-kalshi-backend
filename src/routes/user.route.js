import { Router } from 'express'
import { addBalance, signin_user, signup_user, userProfile, userTransection } from '../controller/user.controlller.js';
import { auth_middleware } from '../middleware/auth.middleware.js';

const userRoute = Router();

userRoute.post('/signup', signup_user);
userRoute.post('/signin', signin_user);

userRoute.patch('/onramp', auth_middleware, addBalance);
userRoute.get('/profile', auth_middleware, userProfile);
userRoute.get('/transection', auth_middleware, userTransection);

export default userRoute;