import { userModel } from "../model/user.model.js";
import { walletModel } from "../model/walletEvent.model.js";
import { createToken } from "../services/jwt.validation.services.js";
import { compareHashPassword, passwordHash } from "../services/passwordHash.services.js";
import { addValueValidation, signinValidation, signupValidation } from "../validators/user.validation.js"

async function signup_user(request, response) {

    const { success, data, error } = signupValidation.safeParse(request.body);
    if (error) { return response.status(400).json({ message: 'enter valid inputs' }) }

    try {
        if (success) {
            const { userName, password, email, balance } = data;
            const HashedPassword = passwordHash(password);

            const user = await userModel.create({
                userName,
                password: HashedPassword,
                email,
                balance
            })

            if (user == null) { return request.status(400).json({ message: 'user is not created', user: user }) }

            return response.status(200).json({ message: 'user is created successfull', user: user })
        }
    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error })
    }
}

async function signin_user(request, response) {
    const { data, error } = signinValidation.safeParse(request.body);
    if (error) { return response.status(400).json({ message: 'enter valid detailes' }) }

    try {
        const { userName, password } = data
        const user = await userModel.findOne({ userName })
        if (!user) {
            return response.status(400).json({
                message: 'user is not founded !'
            })
        }

        const verifyPassword = compareHashPassword(password, user.password)
        if (verifyPassword == false) {
            response.status(404).json({ message: 'password is not validate' })
        }

        const token = createToken(user);
        request.user = user;
        response.cookie('user_cookie', token);
        return response.status(200).json({
            message: 'user loggedin successfully',
            user: user,
            token: token
        });

    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error })
    }
}

async function addBalance(request, response) {
    const { success, data, error } = addValueValidation.safeParse(request.body);
    if (error) { return response.status(400).json({ message: 'enter valid detailes' }) }

    try {
        if (success) {
            const user = await userModel.findByIdAndUpdate(
                request.user.id,
                { $inc: { balance: data.balance } },
                { new: true }
            );

            if (!user) { response.status(400).json({ message: 'user is not found !' }) }

            const walletTransection = await walletModel.create({
                userId: request.user.id,
                tx_type: 'onremp',
                amount: data.balance
            })

            return response.status(200).json({
                message: 'amound creadited',
                amount: data.balance,
                transection: walletTransection,
                user: user
            })
        }
    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error })
    }
}

async function userProfile(request, response) {

    try {
        const user = await userModel.findById(request.user.id).select("-password")
        if (!user) { response.status(400).json({ message: 'user is not found !' }) }

        return response.status(200).json({
            message: 'user is founded',
            user: user
        })

    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error })

    }
}

async function userTransection(request, response) {

    try {
        const userTransection = await walletModel.find({ userId: request.user.id })
        if (!userTransection) { return response.status(400).json({ message: 'user Transection is not found !' }) }

        return response.status(200).json({
            message: 'Transections are founded according to the user',
            userTransections: userTransection
        })
    } catch (error) {
        return response.status(500).json({ message: 'internal server error', error: error })
    }
}

export { signup_user, signin_user, addBalance, userProfile, userTransection }