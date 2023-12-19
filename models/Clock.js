const mongoose = require("mongoose");

const ClockSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        isowned: {
            type: String,
        },
        expiration: {
            type: String,
        },
        isequip: {
            type: String,
        },
        
    },
    {
        timestamps: true
    }
)

const Clock = mongoose.model("Clock", ClockSchema);
module.exports = Clock