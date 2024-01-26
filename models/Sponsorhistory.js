const mongoose = require("mongoose");

const sponsorhistoryschema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Sponsorhistory = mongoose.model("Sponsorhistory", sponsorhistoryschema);
module.exports = Sponsorhistory