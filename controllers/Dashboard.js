const Pooldetails = require("../models/Pooldetails")
const Gamewallet = require("../models/Wallets")
const Communityactivity = require("../modelweb/Communityactivity")
const Leaderboard = require("../models/Leaderboard")
const Ads = require("../modelweb/Ads")
const Gameactivity = require("../modelweb/Gameactivity")
const Walletscutoff = require("../models/Walletscutoff")
const Monmoncoin = require("../modelweb/Monmoncoin")
const Investorfunds = require("../modelweb/Investorfunds")
const Wallethistory = require("../models/Wallethistory")
const Dailylimit = require("../models/Dailylimit")
const Playerdetails = require("../models/Playerdetails")
const Gameunlock = require("../models/Gameunlock")
const Gameusers = require("../models/Gameusers")
const Token = require("../modelweb/Token")
const { default: mongoose } = require("mongoose")
const { DateTimeServer } = require("../utils/Datetimetools")
const fs = require("fs")

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

    data["pools"] = {
        username: pools.owner.username,
        status: pools.status.charAt(0).toUpperCase() + pools.status.slice(1),
        rank: pools.rank,
        subscription: pools.subscription
    }

    //  FOR THE WALLETS
    const wallets = await Gamewallet.find({owner: new mongoose.Types.ObjectId(id)})
    .select("-owner -createdAt -updatedAt -_id")
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["wallets"] = {}
    wallets.forEach(wallet => {
        const { wallettype, amount } = wallet;
        data.wallets[wallettype] = amount;
    });

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
    
    const mcvalue = mclimit / (totalmcval.amount == 0 ? 1 : totalmcval.amount)

    data["mcvalue"] = mcvalue

    const walletscutoff = await Walletscutoff.find({owner: new mongoose.Types.ObjectId(id)})
    .select("-_id -owner -createdAt -updatedAt")
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["walletscutoff"] = {}

    walletscutoff.forEach(walletscutoff => {
        const { wallettype, amount } = walletscutoff;
        data.walletscutoff[wallettype] = amount;
    });

    const playerlb = await Leaderboard.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!playerlb){
        return res.status(404).json({ message: 'notfound' })
    }

    const rank = await Leaderboard.countDocuments({amount: { $gte: playerlb.amount}})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["rank"] = rank

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recruit = await Wallethistory.findOne({owner: new mongoose.Types.ObjectId(id), type: "Subscription Unilevel",  createdAt: {
    $gte: today, // greater than or equal to the start of today
    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // less than the start of tomorrow
    }}).then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["recruit"] = !recruit ? "0" : "1"

    const tools = await Wallethistory.findOne({owner: new mongoose.Types.ObjectId(id), type: "Tools Unilevel",  createdAt: {
    $gte: today, // greater than or equal to the start of today
    $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // less than the start of tomorrow
    }}).then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["tools"] = !tools ? "0" : "1"
    data["datetime"] = DateTimeServer()

    const dailylimitlist = await Dailylimit.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["dailylimit"] = {}
    dailylimitlist.forEach(datalist => {
        const { wallettype, amount } = datalist

        data.dailylimit[wallettype] = amount
    })

    const playerdeets = await Playerdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["profilepicture"] = playerdeets.profilepicture;

    const gameunlock = await Gameunlock.find({owner: new mongoose.Types.ObjectId(id), $or: [{type: "playall"}, {type: "claimall"}]})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (gameunlock.length <= 0){
        data["claimall"] = "0"
        data["playall"] = "0"
    }
    else{
        gameunlock.forEach(unlockdata => {
            data[unlockdata.type] = unlockdata.value
        })
    }

    const gameplayer = await Gameusers.findOne({_id: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["playstatus"] = gameplayer.playstatus

    const tokens = await Token.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    
    tokens.forEach(tokendata => {
        const { type, amount } = tokendata;
        data.wallets[type] = amount;
    });

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
    .then(data => {
        let finaldata = {}

        finaldata["walletscutoff"] = {}

        data.forEach(walletscutoff => {
            const { wallettype, amount } = walletscutoff;
            finaldata.walletscutoff[wallettype] = amount;
        });

        res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.uploadprofilepicture = async (req, res) => {
    const {id} = req.user

    let profilepicturefile = "";

    if (req.file){
        profilepicturefile = req.file.path
    }
    else{
        return res.status(400).json({ message: "failed", 
        data: "Please complete the form before saving the data!" })
    }

    const playerdeets = await Playerdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    console.log(playerdeets.profilepicture)
    if (playerdeets.profilepicture != "none"){
        //  DELETE THE PREVIOUS PROFILE PICTURE

        try{
            fs.unlinkSync(playerdeets.profilepicture)
        }
        catch(ex){
            console.log(`Failed to delete profile picture ${ex.message}`)
        }
    }

    await Playerdetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {profilepicture: profilepicturefile})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message + "huehue" }))

    return res.json({message: "success"})
}