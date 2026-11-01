import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    tx_type: {
        type: String,
        enum: ['onremp', 'created', 'bet', 'payout', 'refund'],
        required: true
    },
    externalId: {
        type: mongoose.Schema.Types.Mixed
    },
    amount: {
        type: Number,
        required: true
    }
})

export const walletModel = mongoose.model('user_wallet', walletSchema);