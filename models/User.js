const {Schema, model} = require('mongoose');

const schema = new Schema({
    name: { type: String, required: true},
    dateOfBirth: { type: Date, required: true},
    city: { type: String, required: true },
    about: { type: String },
    phone: { type: String },
    gender: { type: String, enum: ["male", "female"]},
    photos: { type: Array },
    googleId: { type: String, required: false, unigue: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false},
    skippedPool: { type: Array, required: false},
    sympathies: { type: Array, required: false}
});

module.exports = model('User', schema);
