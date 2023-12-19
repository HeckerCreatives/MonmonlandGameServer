const mongoose = require("mongoose");

const PlaytimegrindingSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        day: {
            type: Number,
        },
        hours: {
            type: Number,
        },
        minute: {
            type: Number,
        },
        seconds: {
            type: Number,
        },
    },
    {
        timestamps: true
    }
)

const Playtimegrinding = mongoose.model("Playtimegrinding", PlaytimegrindingSchema);
module.exports = Playtimegrinding