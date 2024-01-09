const mongoose = require("mongoose");

const DailylimitSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        wallettype: {
            type: String
        },
        amount: {
            type: Number,
            default: 0
        },
        
    },
    {
        timestamps: true
    }
)

const Dailylimit = mongoose.model("DailylimitSchema", DailylimitSchema);
module.exports = Dailylimit