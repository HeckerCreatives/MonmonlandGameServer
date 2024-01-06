const mongoose = require("mongoose");
// const SubsDesc = require('./SubscriptionDescription')

const MerchandiseSchema = new mongoose.Schema(
    {
        item: {
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

const Merchandise = mongoose.model("Merchandise", MerchandiseSchema);

module.exports = Merchandise