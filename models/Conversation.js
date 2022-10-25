const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
    members: { type: Array},
    type: {type: String, enum: ["regular", "anon"], default: 'regular'}
},
{ timestamps: true});


module.exports = model('Conversation', schema);