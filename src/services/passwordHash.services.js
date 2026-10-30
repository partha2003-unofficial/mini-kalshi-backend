import bcrypt from 'bcrypt'

export function passwordHash(password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return hashedPassword;
}

export function compareHashPassword(password, originalPassword) {
    const comparePassword = bcrypt.compareSync(password, originalPassword);
    return comparePassword;
}