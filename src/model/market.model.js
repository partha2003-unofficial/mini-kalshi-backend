import mongoose from "mongoose";

const marketSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
    },
    initialWager: {
        type: Number,
        required: true,
    },
    side: {
        type: String,
        enum: ['yes', 'no'],
        required: true,
    },
    createrId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    expirey: {
        type: Date,
        required: true
    },
    resolution: {
        type: String,
        enum: ['yes', 'no', null],
        default: null
    }
})

export const marketModel = mongoose.model('market', marketSchema);