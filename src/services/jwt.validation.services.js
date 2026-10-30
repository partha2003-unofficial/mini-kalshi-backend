import jwt from 'jsonwebtoken';

export function createToken(user) {

    const payload = {
        id: user._id,
        userName: user.userName
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY_JWT);
    return token;
}

export function verifyToken(token) {
    const tokenVerify = jwt.verify(token, process.env.SECRET_KEY_JWT)
    return tokenVerify;
}