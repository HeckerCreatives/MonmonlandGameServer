const mongoose = require("mongoose");

const AdsSchema = new mongoose.Schema(
    {
        amount: {
            type: Number
        },
    },
    {
        timestamps: true
    }
)

const Ads = mongoose.model("Ads", AdsSchema);
module.exports = Ads