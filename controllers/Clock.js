const Clock = require("../models/Clock")
const { default: mongoose } = require("mongoose")
const { DateTimeServer } = require("../utils/Datetimetools")
const { checkclockexpiration, checkallclockexpiration } = require("../utils/Clockexpiration")

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

    if (previousclockid){
        await Clock.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(previousclockid)}, {isequip: 0})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }

    await Clock.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(clockid)}, {isequip: 1})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}