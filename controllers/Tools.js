const Equipment = require("../models/Equipment")
const Cosmetics = require("../models/Cosmetics")
const { default: mongoose } = require("mongoose")
const { DateTimeServer } = require("../utils/Datetimetools")

exports.gettools = (req, res) => {
    const { id } = req.user

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
    
    const tool = await Equipment.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(toolid)})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (tool.isequip == "1"){
        return res.json({message: "already equip"})
    }

    if (tool.type != "1"){
        if (tool.isowned != "1"){
            return res.json({message: "not owned"})
        }

        else if (tool.expiration >= DateTimeServer.GetUnixtime()){
            await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(toolid)}, {expiration: 0, isowned: 0, isequip: 0})
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
            
            await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: "1"}, {isequip: 1})
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

            return res.json({message: "expired"})
        }
    }

    if (!previoustoolid){
        await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(previoustoolid)}, {isequip: 0})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }

    await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(toolid)}, {isequip: 1})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    return res.json({message: "success"})
}