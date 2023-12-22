const mongoose = require("mongoose");

const GameactivitySchema = new mongoose.Schema(
    {
        total: {
            type: Number
        },
        initial: {
            type: Number
        },
    },
    {
        timestamps: true
    }
)

const Gameactivity = mongoose.model("Gameactivity", GameactivitySchema);
module.exports = Gameactivity