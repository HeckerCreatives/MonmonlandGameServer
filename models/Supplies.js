const mongoose = require("mongoose");

const SuppliesSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "User"
        },
        amount: {
            type: Number,
        },
        
    },
    {
        timestamps: true
    }
)

const Supplies = mongoose.model("Supplies", SuppliesSchema);
module.exports = Supplies