const mongoose = require("mongoose");

const energyInventorySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        name: {
            type: String
        },
        type: {
            type: String  // ring / etc.
        },
        amount: {
            type: Number
        },
        consumableamount: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

const EnergyInventory = mongoose.model("EnergyInventory", energyInventorySchema);
module.exports = EnergyInventory