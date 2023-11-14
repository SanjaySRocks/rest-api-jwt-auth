const jwt = require("jsonwebtoken")
const config = require("../config.js")


const secretKey = config.SECRET_KEY

function generateToken(payload) {
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}


async function authenticateToken(req, res, next) {
   
    if(
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer') ||
        !req.headers.authorization.split(' ')[1]
    ){
        return res.status(422).json({
            message: "Please provide the valid token",
        });
    }

    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Authentication failed. Invalid token.' });
    }
}


async function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

module.exports = { generateToken, authenticateToken }