import { Router } from 'express'
import { resolveMarket } from '../controller/resolveMarketController.js';
const resolveRouter = Router();

resolveRouter.post('/resolvemarker',resolveMarket)

export default resolveRouter;