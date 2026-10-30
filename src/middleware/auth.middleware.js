import { userModel } from "../model/user.model.js";
import { verifyToken } from "../services/jwt.validation.services.js";

export async function auth_middleware(request, response, next) {
    const token = request.header.authorization.split(' ')[1];
    if (!token) {
        return response.status(400).json({ message: 'token is not difined' });
    }

    try {
        const tokenValidatation = verifyToken(token);
        if (tokenValidatation) {
            if (await userModel.findById(tokenValidatation.id)) {
                request.user = tokenValidatation;
                return next();
            }
        }
    } catch (error) {
        return response.status(500).json({ message: 'user is not found !', error: error })
    }
}
