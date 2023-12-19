const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        amount: {
            type: Number,
        },
    },
    {
        timestamps: true
    }
)

const Analytics = mongoose.model("Analytics", AnalyticsSchema);
module.exports = Analytics