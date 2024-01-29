const mongoose = require("mongoose");

const grindingSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        timestarted: {
            type: Number,
            default: 0
        },
        endttime: {
            type: Number,
            default: 0
        },
        harvestmc: {
            type: Number,
        },
        harvestmg: {
            type: Number,
        },
        harvestap: {
            type: Number,
        },
    },
    {
        timestamps: true
    }
)

const GrindingHistory = mongoose.model("GrindingHistory", grindingSchema);
module.exports = GrindingHistory