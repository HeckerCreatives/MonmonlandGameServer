const mongoose = require("mongoose");

const GamewalletSchema = new mongoose.Schema(
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

const Gamewallet = mongoose.model("Gamewallet", GamewalletSchema);
module.exports = Gamewallet