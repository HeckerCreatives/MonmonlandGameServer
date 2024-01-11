const Equipment = require("../models/Equipment")
const { default: mongoose } = require("mongoose")
const { checktoolexpiration, checkalltoolsexpiration, gettoolsamount } = require("../utils/Toolexpiration")
const { sendmgtounilevel, checkwalletamount } = require("../utils/Walletutils")
const { DateTimeServerExpiration } = require("../utils/Datetimetools")
const { computemerchcomplan } = require("../webutils/Communityactivityutils")

exports.gettools = async (req, res) => {
    const { id } = req.user

    const check = await checkalltoolsexpiration(id)

    if (check.message != "success"){
        return res.status(400).json({ message: "bad-request" })
    }


    Equipment.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        if (!data){
            return res.json({message: "success", data: data})
        }

        let finaldata = {}

        data.forEach(toolsdata => {
            const { _id, isowned, expiration, isequip, type } = toolsdata;
            finaldata[type] = {
                id: _id,
                owned: isowned,
                expire: expiration,
                equip: isequip
            }
        });

        res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.equiptools = async (req, res) => {
    const { id } = req.user
    const { toolid, previoustoolid } = req.body

    const check = await checktoolexpiration(id, toolid)

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

    if (previoustoolid && previoustoolid != ""){
        await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(previoustoolid)}, {isequip: 0})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }

    await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(toolid)}, {isequip: 1})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    return res.json({message: "success"})
}

exports.buytools = async (req, res) => {
    const { id } = req.user
    const { toolstype } = req.body
    
    if (process.env.maintenanceitems == "1") {
        return res.json({message: "maintenance"})
    }

    if (toolstype != "2" && toolstype != "3" && toolstype != "4" && toolstype != "5"){
        return res.json({message: "toolsnotexist"})
    }

    let toolsamount = gettoolsamount(toolstype)

    if (toolsamount <= 0){
        return res.json({message: "toolsamountiszero"})
    }

    const checkwallet = await checkwalletamount(toolsamount, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    const sendcoms = await sendmgtounilevel(toolsamount, id, "Tools Unilevel")

    if (sendcoms == "success"){
        const time = DateTimeServerExpiration(30)
        await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: toolstype}, {isowned: "1", expiration: time})
        .then(async () => {
            const complan = await computemerchcomplan(toolsamount, "tools")

            if (complan != "success"){
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