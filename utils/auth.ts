import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in the environment variables')
}

export async function verifyToken(token: string): Promise<boolean> {
    try {
        jwt.verify(token, JWT_SECRET as string)
        return true
    } catch (error) {
        return false
    }
}
