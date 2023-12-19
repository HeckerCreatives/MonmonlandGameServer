const mongoose = require("mongoose");

const CashouthistorySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        status: {
            type: String
        },
        amount: {
            type: Number,
        },
    },
    {
        timestamps: true
    }
)

const Cashouthistory = mongoose.model("Cashouthistory", CashouthistorySchema);
module.exports = Cashouthistory