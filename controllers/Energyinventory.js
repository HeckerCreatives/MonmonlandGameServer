const { default: mongoose } = require("mongoose")
const EnergyInventory = require("../models/Energyinventory")
const Energy = require("../models/Energy")
const Pooldetails = require("../models/Pooldetails")
const { checkenergyringequip, checkequipring } = require("../utils/Cosmeticutils")
const { checkmcwalletamount } = require("../utils/Walletutils")
const { checkenergyinventoryprice, checkenergyinventoryconsumable } = require("../utils/Energyutils")
const { checkmaintenance } = require("../utils/Maintenance")

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
        case "Ruby":
            finalmaxenergy = 80
            break;
        case "Emerald":
            finalmaxenergy = 130
            break;
        case "Diamond":
            finalmaxenergy = 180
            break;
        default:
            finalmaxenergy = 0
            break;
    }

    finalmaxenergy += checkring

    EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
    .then(async energyinventorydata => {
        if (!energyinventorydata){
            return res.json({message: "notexist"})
        }

        const newamount = energyinventorydata.amount - 1
        //  Energy grant
        await Energy.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, [{
            $set: {
                amount: {
                    $min: [finalmaxenergy, {
                        $add: ["$amount", energyinventorydata.consumableamount]
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

exports.buyenergyinventory = async (req, res) => {
    const { id } = req.user
    const { itemname, itemtype, qty } = req.body
    
    const maintenance = await checkmaintenance("maintenanceitems")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    const energyprice = checkenergyinventoryprice(`${itemname}${itemtype}`)

    if (energyprice <= 0){
        return res.json({message: "energyamountiszero"})
    }

    const finalamount = energyprice * qty

    const checkwallet = await checkmcwalletamount(finalamount, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    await EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype})
    .then(async dataenergy => {
        if (!dataenergy){
            await EnergyInventory.create({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype, amount: qty, consumableamount: checkenergyinventoryconsumable(`${itemname}${itemtype}`)})
            .then(() => {
                res.json({message: "success"})
            })
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

            return
        }

        await EnergyInventory.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype}, {$inc: { amount: qty }})
        .then(() => {
            res.json({message: "success"})
        })
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}