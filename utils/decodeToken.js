const jwt = require('jsonwebtoken');
require('dotenv').config();

function decodeUserId(token) {
    const secret = process.env.JWT_SECRET;
    const decodedToken = jwt.verify(token, secret);
    const userId = decodedToken.userId;
    return userId;
}

module.exports = decodeUserId;