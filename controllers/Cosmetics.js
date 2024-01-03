const { default: mongoose } = require("mongoose")
const Cosmetics = require("../models/Cosmetics")
const { checkallcosmeticsexpiration } = require("../utils/Cosmeticexpiration")

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