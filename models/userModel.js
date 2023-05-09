
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    is_admin: {
        type: Number,
        required: true
    },
    is_varified: {
        type: Number,
        default: 0
    },
    otp:{
        type:Number,
        required:true
    },
    token:
    {
        type:String,
        default:' '
    },
    createdAt: Date,
    expiresAt : Date,

});

const User = mongoose.model('User', userSchema);

module.exports = User;
