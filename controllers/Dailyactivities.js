const { default: mongoose } = require("mongoose")
const Dailyactivities = require("../models/Dailyactivities")
const Playtimegrinding = require("../models/Playtimegrinding")
const Wallethistory = require("../models/Wallethistory")
const { getavailabledailyactivities } = require("../utils/Dailyactivities")
const { getpooldetails } = require("../utils/Pooldetailsutils")
const { addwalletamount, addpointswalletamount } = require("../utils/Walletutils")
const { setleaderboard } = require("../utils/Leaderboards")
const { addtototalfarmmc } = require("../utils/Gameutils")

exports.getdailyactivities = async (req, res) => {
    const { id } = req.user

    await Dailyactivities.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        const finaldata = {}

        data.forEach(activity => {
            const { type, status, rewardsmc, taskpoints } = activity

            finaldata[type] = {
                status: status,
                rewardsmc: rewardsmc,
                taskpoints: taskpoints
            }
        })

        return res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.claimdaily = async (req, res) => {
    const { id } = req.user
    const { type } = req.body

    const pools = await getpooldetails(id)

    if (pools == "erroraccount"){
        return res.json({message: "erroraccount"})
    }

    if (pools == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    const checkrank = getavailabledailyactivities(pools.subscription, type)

    if (checkrank == "notplay"){
        return res.json({message: "restricted"})
    }

    Dailyactivities.findOne({owner: new mongoose.Types.ObjectId(id), type: type, status: "not-claimed"})
    .then(async data => {
        if (!data){
            return res.json({message: "cantclaim"})
        }

        if (type == "2"){
            const grindplaytime = await Playtimegrinding.findOne({owner: new mongoose.Types.ObjectId(id), currenttime: { $gte: 43200}})

            if (!grindplaytime){
                return res.json({message: "tasknotcomplete"})
            }
        }
        else if (type == "3"){
            const grindplaytime = await Playtimegrinding.findOne({owner: new mongoose.Types.ObjectId(id), currenttime: { $gte: 54000}})

            if (!grindplaytime){
                return res.json({message: "tasknotcomplete"})
            }
        }
        else if (type == "4"){
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const recruit = await Wallethistory.findOne({owner: new mongoose.Types.ObjectId(id), type: "Subscription Unilevel",  createdAt: {
                $gte: today, // greater than or equal to the start of today
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // less than the start of tomorrow
            }}).then(data => data)
            .catch(err => {
                console.log(err.message)
                return res.status(400).json({ message: "bad-request", data: err.message })
            })

            if (!recruit){
                return res.json({message: "tasknotcomplete"})
            }
        }
        else if (type == "5"){
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const tools = await Wallethistory.findOne({owner: new mongoose.Types.ObjectId(id), type: "Tools Unilevel",  createdAt: {
                $gte: today, // greater than or equal to the start of today
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // less than the start of tomorrow
            }}).then(data => data)
            .catch(err => {
                console.log(err.message)
                return res.status(400).json({ message: "bad-request", data: err.message })
            })

            if (!tools){
                return res.json({message: "tasknotcomplete"})
            }
        }

        await Dailyactivities.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: type, status: "not-claimed"}, {status: "claimed"})
        .then(async () => {

            if (pools.subscription != "Pearl"){
                const addtofarm = await addtototalfarmmc(data.rewardsmc, 0)
                if (addtofarm.message != "success"){
                    return res.status(400).json({message: "bad-request"})
                }

                const mc = await addwalletamount(id, "monstercoin", addtofarm.mctobeadded)

                if (mc != "success"){
                    return res.status(400).json({message: "bad-request"})
                }
            }
            else{
                const mc = await addwalletamount(id, "monstercoin", data.rewardsmc)

                if (mc != "success"){
                    return res.status(400).json({message: "bad-request"})
                }
            }
            
            const tp = await addpointswalletamount(id, "taskpoints", data.taskpoints)
            const addlbpoints = await setleaderboard(id, data.taskpoints)


            if (tp != "success"){
                return res.status(400).json({message: "bad-request"})
            }

            if (addlbpoints != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
            
            res.json({message: "success"})
        })
        .catch(err => {
            console.log(err.message)
            return res.status(400).json({ message: "bad-request", data: err.message })
        })
    })
    .catch(err => {
        console.log(err.message)
        return res.status(400).json({ message: "bad-request", data: err.message })
    })
}