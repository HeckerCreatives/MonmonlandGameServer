const mongoose = require("mongoose");
// const SubsDesc = require('./SubscriptionDescription')

const SubsAccumulatedSchema = new mongoose.Schema(
    {
        subsname: {
            type: String
        },
        amount: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

const SubsAccumulated = mongoose.model("SubsAccumulated", SubsAccumulatedSchema);

module.exports = SubsAccumulated