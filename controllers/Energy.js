const { default: mongoose } = require("mongoose")
const Energy = require("../models/Energy")

exports.getenergy = (req, res) => {
    Energy.findOne({owner: new mongoose.Types.ObjectId(req.user.id)})
    .then(data => {
        if (!data){
            return res.json({message: "failed"})
        }

        return res.json({message: "success", data: data.amount})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}