const Clock = require("../models/Clock")
const { default: mongoose } = require("mongoose")
const { checkclockexpiration, checkallclockexpiration, getclocksamount } = require("../utils/Clockexpiration")
const { sendmgtounilevel, checkwalletamount, rebatestowallet } = require("../utils/Walletutils")
const { DateTimeServerExpiration } = require("../utils/Datetimetools")
const { computemerchcomplan } = require("../webutils/Communityactivityutils")
const { checkmaintenance } = require("../utils/Maintenance")

exports.getclock = async (req, res) => {
    const { id } = req.user

    const checkexpiration = await checkallclockexpiration(id)

    if (checkexpiration != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    Clock.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        if (!data){
            return res.json({message: "success", data: data})
        }

        let finaldata = {}

        data.forEach(clockdata => {
            const { _id, isowned, expiration, isequip, type} = clockdata

            finaldata[type] = {
                id: _id,
                owned: isowned,
                expire: expiration,
                equip: isequip
            }
        })

        res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.equipclock = async (req, res) => {
    const { id } = req.user
    const { clockid, previousclockid } = req.body

    const check = await checkclockexpiration(id, clockid)

    if (check.message == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }
    else if (check.message == "notexist"){
        return res.status(400).json({ message: "notexist" })
    }
    else if (check.message == "expired"){
        return res.status(400).json({ message: "expired" })
    }

    if (check.data.isequip == "1"){
        return res.json({message: "already equip"})
    }

    if (check.data.isowned != "1"){
        return res.json({message: "not owned"})
    }

    if (previousclockid && previousclockid != ""){
        await Clock.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(previousclockid)}, {isequip: 0})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }

    await Clock.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(clockid)}, {isequip: 1})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    res.json({message: "success"})
}

exports.buyclocks = async (req, res) => {
    const { id } = req.user
    const { clockstype } = req.body

    const maintenance = await checkmaintenance("maintenanceitems")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    if (clockstype != "1" && clockstype != "2" && clockstype != "3" && clockstype != "4"){
        return res.json({message: "clocksnotexist"})
    }

    let clocksamount = getclocksamount(clockstype)

    if (clocksamount <= 0){
        return res.json({message: "clocksamountiszero"})
    }

    const checkwallet = await checkwalletamount(clocksamount, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    const sendcoms = await sendmgtounilevel(clocksamount, id, "Clocks Unilevel", clockstype, "merchandise")

    if (sendcoms == "success"){
        const time = DateTimeServerExpiration(30)
        await Clock.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: clockstype}, {isowned: "1", expiration: time})
        .then(async () => {

            const complan = await computemerchcomplan(clocksamount)
            const rebates = await rebatestowallet(id, "balance", clocksamount * 0.05, "Clocks")

            if (complan != "success"){
                res.status(400).json({ message: "bad-request" })
            }

            if (rebates != "success"){
                res.status(400).json({ message: "bad-request" })
            }
            
            return res.json({message: "success"})
        })
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }
    else{
        res.json({message: "failed"})
    }
}