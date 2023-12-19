const mongoose = require("mongoose");

const IngameleaderboardSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        amount: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
)

const Ingameleaderboard = mongoose.model("Ingameleaderboard", IngameleaderboardSchema);
module.exports = Ingameleaderboard