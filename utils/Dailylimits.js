const { default: mongoose } = require("mongoose")
const Dailylimit = require("../models/Dailylimit")

exports.checkdailylimitwallet = async(id, type) => {
    return await Dailylimit.findOne({owner: new mongoose.Types.ObjectId(id), wallettype: type})
    .then(data => data)
    .catch(() => "bad-request")
}

exports.watchadsdailylimit = async(subscription) => {

}