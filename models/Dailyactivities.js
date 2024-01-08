const mongoose = require("mongoose");

const DailyactivitiesSchema = new mongoose.Schema(
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
        taskpoints: {
            type: Number
        },
        rewardsmc: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

const Dailyactivities = mongoose.model("Dailyactivities", DailyactivitiesSchema);
module.exports = Dailyactivities