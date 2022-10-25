const {Schema, model, Types} = require('mongoose');

const schema = new Schema({
    conversationId: { type: String },
    sender: { type: String},
    text: { type: String},
    isRead: { type: Boolean}
},
{ timestamps: true});


module.exports = model('Message', schema);