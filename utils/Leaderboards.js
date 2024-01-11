const { default: mongoose } = require("mongoose")
const Ingameleaderboard = require("../models/Leaderboard")

exports.setleaderboard = async (id, amount) => {
    return await Ingameleaderboard.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, { $inc: { amount: amount}})
    .then(() => "success")
    .catch(() => "bad-request")   
}