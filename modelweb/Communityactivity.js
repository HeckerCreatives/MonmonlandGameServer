const mongoose = require("mongoose");

const CommunityactivitySchema = new mongoose.Schema(
    {
        type: {
            type: String
        },
        amount: {
            type: Number
        },
    },
    {
        timestamps: true
    }
)

const Communityactivity = mongoose.model("Communityactivity", CommunityactivitySchema);
module.exports = Communityactivity