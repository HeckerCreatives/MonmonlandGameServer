const mongoose = require("mongoose");

const InvestorfundsSchema = new mongoose.Schema(
    {
        amount: {
            type: Number
        },
    },
    {
        timestamps: true
    }
)

const Investorfunds = mongoose.model("Investorfunds", InvestorfundsSchema);
module.exports = Investorfunds