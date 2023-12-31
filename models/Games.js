const mongoose = require("mongoose");

const IngamegamesSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        status: {
            type: String,
        },
        timestarted: {
            type: Number
        },
        unixtime: {
            type: Number,
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

const Ingamegames = mongoose.model("Ingamegames", IngamegamesSchema);
module.exports = Ingamegames