import { Router } from 'express'
import { auth_middleware } from '../middleware/auth.middleware.js';
import { createMarket, getBets, getMarkets, placeBet } from '../controller/market.controller.js';

const marketRoute = Router();

marketRoute.route('/').post(auth_middleware, createMarket).get(getMarkets);

marketRoute.post('/bet', auth_middleware, placeBet);
marketRoute.get('/bets', auth_middleware, getBets)

export default marketRoute;