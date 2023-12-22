const Playerdetails = require("../models/Playerdetails")
const Paymentdetails = require("../models/Paymentdetails")
const { default: mongoose } = require("mongoose")

exports.personalinformation = async (req, res) => {
    const { id } = req.user

    let data = {}

    const player = await Playerdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .populate({
        path: "owner",
        select: "username"
    })
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["player"] = {
        username: player.owner.username,
        referralid: player.owner._id,
        email: player.email
    }

    const payment = await Paymentdetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    data["payment"] = {
        options: !payment ? "" : payment.paymentoption,
        method: !payment ? "" : payment.paymentmethod,
        currency: !payment ? "" : payment.currency
    }

    res.json({message: "success", data: data})
}