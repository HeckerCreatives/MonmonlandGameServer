const mongoose = require("mongoose");

const WallethistorySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        description: {
            type: String,
        },
        amount: {
            type: Number,
        },
        historystructure: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

const Wallethistory = mongoose.model("Wallethistory", WallethistorySchema);
module.exports = Wallethistory