const { default: mongoose } = require("mongoose")
const Cosmetics = require("../models/Cosmetics")
const { checkallcosmeticsexpiration, checkcosmeticexpiration } = require("../utils/Cosmeticutils")

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