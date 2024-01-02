const mongoose = require("mongoose");

const CommissionHistorySchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        amount: {
            type: Number,
        }
    },
    {
        timestamps: true
    }
)

const CommissionHistory = mongoose.model("CommissionHistorySchema", CommissionHistorySchema);
module.exports = CommissionHistory