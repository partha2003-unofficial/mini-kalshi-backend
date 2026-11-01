import express from 'express'
import env from 'dotenv'
env.config()
import userRoute from './routes/user.route.js';
import { databaseConnection } from './db.connection.js';
import marketRoute from './routes/maket.route.js';
import resolveRouter from './routes/resolve.route.js';
import { auth_middleware } from './middleware/auth.middleware.js';

const application = express();

application.use(express.json());
application.use(express.urlencoded({ extended: true }))

application.use("/api/v1/user", userRoute)
application.use("/api/v1/market", marketRoute)
application.use("/api/v1/resolve", auth_middleware, resolveRouter)

function main() {
    databaseConnection(process.env.DATABASE_CONNECTION_URL)
    application.listen(process.env.BACKEND_PORT, () => console.log('server is running..'));
}

main().catch(console.error)