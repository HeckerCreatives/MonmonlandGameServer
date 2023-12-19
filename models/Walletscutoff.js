const mongoose = require("mongoose");

const WalletscutoffSchema = new mongoose.Schema(
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

const Walletscutoff = mongoose.model("Walletscutoff", WalletscutoffSchema);
module.exports = Walletscutoff