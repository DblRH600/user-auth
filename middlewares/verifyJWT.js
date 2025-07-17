import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const secret = process.env.JWT_SECRET;

export default function verifyJWT(req, res, next) {
    let token = req.headers.authorization;

    // Bearer <token> here
    if (token) {
        token = token.split(' ').pop().trim();
    }

    if (!token) {
        return res.status(401).json({ message: 'No token provided' })
    }

    try {
        const { data } = jwt.verify(token, secret, { maxAge: '2h' });
        req.user = data; // attach user data to request obj
        next(); // call next mw or route handler
    } catch (error) {
        console.error('JWT verification error: ', error)
        return res.status(403).json({ message: 'Invalid token' })
    }

}


// req -> middlewar (req.uer = data) -> route -> res