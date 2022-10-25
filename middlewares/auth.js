const User = require('../models/User');
const decodeUserId = require('../utils/decodeToken');


module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const userId = decodeUserId(token);
    const user = await User.findOne({_id: userId})
    if (!user) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch(e) {
      console.log(e);
    res.status(401).json({
      error: 'Invalid request'
    });
  }
};