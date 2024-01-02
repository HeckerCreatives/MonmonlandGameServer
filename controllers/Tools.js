const Equipment = require("../models/Equipment")
const { default: mongoose } = require("mongoose")
const { checktoolexpiration, checkalltoolsexpiration } = require("../utils/Toolexpiration")

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

    if (previoustoolid){
        await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(previoustoolid)}, {isequip: 0})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }

    await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(toolid)}, {isequip: 1})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    return res.json({message: "success"})
}