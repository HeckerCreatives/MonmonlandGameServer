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
        
    },
    {
        timestamps: true
    }
)

const Dailyactivities = mongoose.model("Dailyactivities", DailyactivitiesSchema);
module.exports = Dailyactivities