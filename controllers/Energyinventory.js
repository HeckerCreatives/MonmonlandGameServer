const { default: mongoose } = require("mongoose")
const EnergyInventory = require("../models/Energyinventory")
const Energy = require("../models/Energy")
const { checkenergyringequip } = require("../utils/Cosmeticutils")

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

    EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
    .then(data => {
        if (!data){
            return res.json({message: "notexist"})
        }

        const newamount = data.amount - 1


        //  Energy grant
        Energy.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {$inc: {amount: consumableamount}})

        if (newamount <= 0){
            EnergyInventory.findOneAndDelete({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
        }
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}