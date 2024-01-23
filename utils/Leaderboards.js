const { default: mongoose } = require("mongoose")
const Ingameleaderboard = require("../models/Leaderboard")
const Fiesta = require("../models/Fiesta")

exports.setleaderboard = async (id, amount) => {
    return await Ingameleaderboard.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, { $inc: { amount: amount}})
    .then(() => "success")
    .catch(() => "bad-request")   
}

exports.setfiestaleaderboard = async (id, type, amount) => {
    return await Fiesta.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: type}, { $inc: { amount: amount}})
    .then(() => "success")
    .catch(() => "bad-request")   
}