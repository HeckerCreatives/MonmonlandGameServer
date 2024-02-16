const mongoose = require("mongoose");

const SponsorSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        itemwon: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

const Sponsor = mongoose.model("Sponsor", SponsorSchema);
module.exports = Sponsor