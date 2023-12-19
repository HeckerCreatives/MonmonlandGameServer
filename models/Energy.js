const mongoose = require("mongoose");

const EnergySchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        amount: {
            type: Number,
        },
        
    },
    {
        timestamps: true
    }
)

const Energy = mongoose.model("Energy", EnergySchema);
module.exports = Energy