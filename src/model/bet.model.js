import mongoose from "mongoose";

const betSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    marketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'market'
    },
    betAmount: {
        type: Number,
        required: true
    }
})

export const betModel = mongoose.model('bet', betSchema)