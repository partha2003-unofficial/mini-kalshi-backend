import { betModel } from "../model/bet.model.js";
import { marketModel } from "../model/market.model.js";
import { userModel } from "../model/user.model.js";
import { walletModel } from "../model/walletEvent.model.js";
import { resolveMarketValidation } from "../validators/resolve.validation.js";

export async function resolveMarket(request, response) {

    /* error handling */
    const { data, error } = resolveMarketValidation.safeParse(request.body);
    if (error) { return response.status(400).json({ message: 'all data is required !' }) };

    const market = await marketModel.findById(data.marketId);
    if (!market) {
        return response.status(400).json({
            message: 'This market is not fonded!',
            given_marketId: data.marketId,
            fatchMarketId: market?._id || []
        })
    }

    try {
        if (!(market.createrId == request.user.id)) {
            return response.status(404).json({
                message: "other user can't resolve the market , only created user can resolve the market"
            })
        }

        if (!market.resolution == null) {
            return response.status(400).json({
                message: 'market is already resolved !'
            })
        }

        /* excution */
        const marketAccordingBets = await betModel.find({ marketId: data.marketId })
        const totalAmountAllBets = marketAccordingBets
            .reduce((totalAmount, currentBitAmount) => {
                totalAmount + currentBitAmount.betAmount
            })

        // if creator win 
        if (data.resolution == market.side) {
            const amount = totalAmountAllBets * 2 + (market.initialWager - totalAmountAllBets);

            await userModel
                .findByIdAndUpdate(
                    market.createrId,
                    { $inc: { balance: amount } },
                    { new: true }
                )

            await walletModel.create({
                userId: market.createrId,
                tx_type: 'payout',
                externalId: market._id,
                amount
            })
        } else {
            // if other win 
            for (bet of marketAccordingBets) {
                const payload = bet.betAmount * 2;

                const user = await userModel.updateOne(
                    { _id: bet.userId },
                    { $inc: { balance: payload } }
                )
                await walletModel.create({
                    userId: user._id,
                    tx_type: 'payout',
                    externalId: market._id,
                    amount: payload
                })
            }
            //refund to creator account
            const refund = market.initialWager > totalAmountAllBets
            if (refund > 0) {
                await userModel.updateOne(
                    { _id: market.createrId },
                    { $inc: { balance: refund } }
                )

                await walletModel.create({
                    userId: market.createrId,
                    tx_type: 'payout',
                    externalId: market._id,
                    amount: refund
                })
            }
        }

        market.resolution = data.resolution;
        await market.save();

        return response.status(200).json({
            message: "market successfully resolved",
            market: market
        })
    } catch (error) {
        return response.status(500).json({
            message: "internal server error",
            error: error.message
        })
    }
}