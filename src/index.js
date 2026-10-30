import express from 'express'
import env from 'dotenv'
import userRoute from './routes/user.route.js';
import { databaseConnection } from './db.connection.js';
env.config()

const application = express();

application.use(express.json());
application.use(express.urlencoded({ extended: true }))

application.use("/api/v1/user", userRoute)

function main() {
    databaseConnection(process.env.DATABASE_CONNECTION_URL)
    application.listen(process.env.BACKEND_PORT, () => console.log('server is running..'));
}

main().catch(console.error)