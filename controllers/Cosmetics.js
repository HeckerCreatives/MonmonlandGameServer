const { default: mongoose } = require("mongoose")
const Cosmetics = require("../models/Cosmetics")
const { checkallcosmeticsexpiration, checkcosmeticexpiration, getcosmeticsamount } = require("../utils/Cosmeticutils")
const { sendmgtounilevel, checkwalletamount } = require("../utils/Walletutils")
const { DateTimeServerExpiration } = require("../utils/Datetimetools")
const { checkmaintenance } = require("../models/Maintenance")

exports.getcosmetics = async (req, res) => {
    const { id } = req.user

    const check = await checkallcosmeticsexpiration(id)

    if (check != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    await Cosmetics.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        if (data.length <= 0){
            return res.json({message: "noitems"})
        }

        let finaldata = {}

        data.forEach(cosmeticsdata => {
            const { _id, name, type, expiration, permanent, isequip} = cosmeticsdata

            finaldata[`${name}${type}`] = {
                id: _id,
                expire: expiration,
                permanent: permanent,
                equip: isequip
            }
        })

        res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.equipcosmetics = async (req, res) => {
    const { id } = req.user
    const { cosmeticid, previouscosmeticid } = req.body

    const check = await checkcosmeticexpiration(id, cosmeticid)

    if (check.message == "notexist"){
        return res.json({message: "notexist"})
    }

    if (check.message == "expired"){
        return res.json({message: "expired"})
    }

    if (check.message == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (check.data.isequip == "1"){
        return res.json({message: "already equip"})
    }

    if (previouscosmeticid != ""){
        await Cosmetics.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(previouscosmeticid)}, {isequip: "0"})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }

    await Cosmetics.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(cosmeticid)}, {isequip: "1"})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    return res.json({message: "success"})
}

exports.buycosmetics = async (req, res) => {
    const { id } = req.user
    const { cosmeticstype, itemname, itemtype } = req.body
    
    const maintenance = await checkmaintenance("maintenanceitems")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    if (cosmeticstype != "Rubyring" && cosmeticstype != "Emeraldring" && cosmeticstype != "Diamondring" && cosmeticstype != "Energyring"){
        return res.json({message: "cosmeticsnotexist"})
    }

    let cosmeticsamount = getcosmeticsamount(cosmeticstype)

    if (cosmeticsamount <= 0){
        return res.json({message: "clocksamountiszero"})
    }

    const checkwallet = await checkwalletamount(cosmeticsamount, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    const sendcoms = await sendmgtounilevel(cosmeticsamount, id, "Cosmetics Unilevel", `${itemname}${itemtype}`, "cosmetics")

    if (sendcoms == "success"){
        const time = DateTimeServerExpiration(30)
        await Cosmetics.create({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype, expiration: time, permanent: "nonpermanent", isequip: "0"})
        .then(() => {
            return res.json({message: "success"})
        })
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }
    else{
        res.json({message: "failed"})
    }
}