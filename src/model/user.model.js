import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    userName: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required
    },
    email: {
        type: String,
        required: true,
        unique
    },
    balance: {
        type: Number,
        default: 0
    }
})

export const userModel = mongoose.model('user', userSchema);