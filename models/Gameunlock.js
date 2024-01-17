const mongoose = require("mongoose");

const gameunlockSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        value: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Gameunlock = mongoose.model("Gameunlock", gameunlockSchema);
module.exports = Gameunlock