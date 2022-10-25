const {Schema, model} = require('mongoose');

const schema = new Schema({
    id1: {type: String, required: true},
    id2: {type: String, required: true}
});


module.exports = model('PotentialMatch', schema);