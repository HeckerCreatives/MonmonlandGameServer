const mongoose = require("mongoose");

const PlayerdetailsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        phone: {
            type: String
        },
        email: {
            type: String
        },
        walletaddress: {
            type: String
        },
        profilepicture: {
            type: String,
            default: "none"
        }
    },
    {
        timestamps: true
    }
)

const Playerdetails = mongoose.model("Playerdetails", PlayerdetailsSchema);
module.exports = Playerdetails