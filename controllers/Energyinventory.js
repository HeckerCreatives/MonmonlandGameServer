const { default: mongoose } = require("mongoose")
const EnergyInventory = require("../models/Energyinventory")
const Energy = require("../models/Energy")
const Pooldetails = require("../models/Pooldetails")
const { checkenergyringequip, checkequipring } = require("../utils/Cosmeticutils")

exports.getenergyinventory = (req, res) => {
    const { id } = req.user

    EnergyInventory.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        if (data.length <= 0){
            return res.json({message: "noitems"})
        }
        
        let finaldata = {}

        data.forEach(energydata => {
            const { _id, type, amount, name } = energydata

            finaldata[`${name}${type}`] = {
                id: _id,
                amount: amount
            }
        })

        res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.useenergyinventory = async (req, res) => {
    const { id } = req.user
    const { itemid } = req.body

    const checkenergyring = await checkenergyringequip(id)

    if (checkenergyring == "equip"){
        return res.json({message: "equipenergyring"})
    }

    const checkring = await checkequipring(id)

    if (checkring == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    const subslevel = await Pooldetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        if (!data){
            return res.status(400).json({ message: "bad-request" })
        }

        return data.subscription
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    let finalmaxenergy = 0

    switch(subslevel){
        case "Pearl":
            finalmaxenergy = 20
            break;
        case "Emerald":
            finalmaxenergy = 40
            break;
        case "Diamond":
            finalmaxenergy = 80
            break;
        default:
            finalmaxenergy = 0
            break;
    }

    finalmaxenergy += checkring

    EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
    .then(async data => {
        if (!data){
            return res.json({message: "notexist"})
        }

        const newamount = data.amount - 1

        //  Energy grant
        await Energy.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, [{
            $set: {
                amount: {
                    $min: [finalmaxenergy, {
                        $add: ["$amount", data.consumableamount]
                    }]
                }
            }
        }])
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

        if (newamount <= 0){
            await EnergyInventory.findOneAndDelete({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

            return res.json({message: "success"})
        }

        await EnergyInventory.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)}, [{
            $set: {
                amount: {
                    $max: [0, {
                        $add: ["$amount", -1]
                    }]
                }
            }
        }])

        return res.json({message: "success"})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}