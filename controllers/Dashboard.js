const Pooldetails = require("../models/Pooldetails")
const Gamewallet = require("../models/Wallets")
const Communityactivity = require("../modelweb/Communityactivity")
const Leaderboard = require("../models/Leaderboard")
const Ads = require("../modelweb/Ads")
const Gameactivity = require("../modelweb/Gameactivity")
const Walletscutoff = require("../models/Walletscutoff")
const Monmoncoin = require("../modelweb/Monmoncoin")
const Investorfunds = require("../modelweb/Investorfunds")
const { default: mongoose } = require("mongoose")

exports.dashboardplayer = async (req, res) => {
    const { id } = req.user

    let data = {}

    const pools = await Pooldetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .select("-_id -createdAt -updatedAt")
    .populate({
        path: "owner",
        select: "username -_id"
    })
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["pools"] = pools

    //  FOR THE WALLETS
    const wallets = await Gamewallet.find({owner: new mongoose.Types.ObjectId(id)})
    .select("-owner -createdAt -updatedAt -_id")
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["wallets"] = {
        "monstercoin": wallets.filter(e => e.wallettype == "monstercoin")[0],
        "monstergem": wallets.filter(e => e.wallettype == "monstergem")[0],
        "balance": wallets.filter(e => e.wallettype == "balance")[0]
    }

    //  FOR THE MC TOTAL VALUE
    const totalmcval = await Monmoncoin.findOne({name: "Monster Coin"})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const ads = await Ads.findOne()
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const investors = await Investorfunds.findOne()
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const gameactivity = await Gameactivity.findOne()
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const communityactivity = await Communityactivity.find()
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const grinding = communityactivity.filter(e => e.type == "grinding")
    const quest = communityactivity.filter(e => e.type == "quest")

    const mclimit = grinding[0].amount + quest[0].amount + gameactivity.total + ads.amount + investors.amount
    const mcvalue = mclimit / totalmcval.amount

    data["mcvalue"] = mcvalue

    const walletscutoff = await Walletscutoff.find({owner: new mongoose.Types.ObjectId(id)})
    .select("-_id -owner -createdAt -updatedAt")
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["walletscutoff"] = walletscutoff

    const playerlb = await Leaderboard.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!playerlb){
        return res.status(404).json({ message: 'notfound' })
    }

    const rank = await Leaderboard.countDocuments({amount: { $gte: playerlb.amount}})
    .then(data => data + 1)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["rank"] = rank

    res.json({message: "success", data: data})
}

exports.findpooldetails = (req, res) => {
    const { id } = req.user

    Pooldetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .select("-_id -createdAt -updatedAt")
    .populate({
        path: "owner",
        select: "username -_id"
    })
    .then(data => res.json({message: "success", data: data}))
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.findwallet = (req, res) => {
    const { id } = req.user
    const { type } = req.query

    Gamewallet.findOne({owner: new mongoose.Types.ObjectId(id), wallettype: type})
    .select("-owner -createdAt -updatedAt -_id")
    .then(data => res.json({message: "success", data: data}))
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.findwalletcutoff = (req, res) => {
    const { id } = req.user

    Walletscutoff.find({owner: new mongoose.Types.ObjectId(id)})
    .select("-owner -createdAt -updatedAt -_id")
    .then(data => res.json({message: "success", data: data}))
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}
