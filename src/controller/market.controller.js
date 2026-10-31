import { betModel } from "../model/bet.model.js";
import { marketModel } from "../model/market.model.js";
import { userModel } from "../model/user.model";
import { walletModel } from "../model/walletEvent.model.js";
import { createBetValidation, createMarketValidation } from "../validators/market.validation.js";

export async function createMarket(request, response) {

    try {
        /*error handlers*/

        const { data, error } = createMarketValidation.safeParse(request.body);
        if (error) { return response.status(400).json({ message: 'enter valid detailes' }) };

        const user = await userModel.findById(request.user.id);
        if (!user) { return response.status(400).json({ message: 'user is not found !' }) }

        if (data.initialWager > user.balance) {
            return response.status(400).json({
                message: 'insuffecent balance',
                marketCreateBalance: data.initialWager,
                userBalance: user.balance
            })
        }

        if (data.expirey <= new Date()) {
            return response.status(400).json({ message: 'the market is already expaired !' })
        }

        /*execution*/

        user.balance -= initialWager;
        await user.save();

        const createMarket = await marketModel.create({
            ...data,
            createrId: user._id,
        })

        const walletTransection = await walletModel.create({
            userId: user._id,
            tx_type: "created",
            externalId: { marketId: createMarket._id },
            amount: data.initialWager
        })

        if (createMarket && walletTransection) {
            return response.status(200).json({
                message: 'market created successful',
                market: createMarket,
            })
        }
    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error.message })
    }
}

export async function getMarkets(request, response) {
    try {
        //find only existing markets
        const markets = await marketModel
            .find({
                expirey: { $gt: new Date() },
                resolution: null
            })
            .populate('createrId', 'userName')

        if (!markets) { return response.status(200).json({ message: 'no markets are present!' }) }

        return response.status(200).json({
            message: 'all markets are fatched..',
            allMarket: markets
        })

    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error.message })
    }

}

export async function placeBet(request, response) {
    /*error handling*/
    const { data, error } = createBetValidation.safeParse(request.body)
    if (error) { return response.status(400).json({ message: 'enter valid detailes' }) };

    try {
        const { marketId, betAmount } = data;

        const market = await marketModel.findById(marketId);

        if (!market) {
            return response.status(400).json({
                message: 'market is not found !'
            })
        }

        if (market.expirey <= new data()) {
            return response.status(400).json({
                message: 'market is already exist'
            })
        }

        if (!market.resolution == null) {
            return response.status(400).json({
                message: 'market is already exist'
            })
        }

        if (market.createrId == response.user.id) {
            return response.status(400).json({
                message: 'market creator cannot bet in his market'
            })
        }

        const existingBets = await betModel.findById(marketId);
        const allBetsTotalAmount = existingBets.reduce(
            (sum, bet) => sum += bet.betAmount
        )

        if (allBetsTotalAmount + betAmount > market.initialWager) {
            return response.status(200).json({
                message: 'bets are not available due to exceeds limit',
                allBets_TotalAmount: allBetsTotalAmount,
                market_initialWager: market.initialWager
            })
        }

        const user = await userModel.findById(request.user.id);
        if (user == null) { return response.status(400).json({ message: 'user is not found !' }) }

        if (betAmount > user.balance) {
            return response.status(400).json({
                message: 'insufficent balance',
                betAmount: betAmount,
                userWalletBalance: user.balance
            })
        }

        /*execution*/
        user.balance -= betAmount;
        await user.save();

        const betCreate = await betModel.create({
            userId: request.user.id,
            marketId: market._id,
            betAmount
        })

        await walletModel.create({
            userId: request.user.id,
            tx_type: 'bet',
            externalId: betCreate._id,
            amount: betAmount
        })

        return response.status(200).json({
            message: 'bet created successfull',
            bet_amount: betAmount
        })

    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error.message });
    }
}

export async function getBets(request, response) {

    try {
        const bets = await betModel
            .find({ userId: request.user.id })
            .populate('marketId')

        if (bets) {
            return response.status(200).json({
                message: 'all bets are successfully fatched',
                bets: bets
            })
        }

    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error.message })
    }
}