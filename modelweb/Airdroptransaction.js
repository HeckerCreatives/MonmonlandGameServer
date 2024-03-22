const mongoose = require("mongoose");

const AirdroptransactionSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        questid: {
            type: Number // numbering
        },
        questtitle: {
            type: String // quest title
        },
        mmttokenreward: {
            type: Number // tokenamount to be claim
        },
        mcttokenreward: {
            type: Number // tokenamount to be claim
        },
        acceptAt: {
            type: String, // kung kelan inacept
        },
        expiredAt: {
            type: String, // kung kelan mag eexpire
        },
        claimedAt: {
            type: String, // kung kelan niya kinuha
        }
    },
    {
        timestamps: true
    }
)

const Airdroptransaction = mongoose.model("Airdroptransaction", AirdroptransactionSchema);
module.exports = Airdroptransaction