const { default: mongoose } = require("mongoose")
const Analytics = require("../models/Analytics")

exports.addanalytics = async(id, type, amount) => {
    return await Analytics.create({owner: new mongoose.Types.ObjectId(id), type: type, amount: amount})
    .then(() => "success")
    .catch(() => "bad-request")
}