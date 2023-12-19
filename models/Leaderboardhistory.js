const mongoose = require("mongoose");

const LeaderboardhistorySchema = new mongoose.Schema(
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

const Leaderboardhistory = mongoose.model("Leaderboardhistory", LeaderboardhistorySchema);
module.exports = Leaderboardhistory