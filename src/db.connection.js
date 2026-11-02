import mongoose from "mongoose";

export async function databaseConnection(url) {
    await mongoose.connect(url)
        .then((data) => console.log('database connnection successful..',))
        .catch((error) => {
            console.log(`database did not connected ! error: ${error}`)
            return process.exit(1)
        })
}
