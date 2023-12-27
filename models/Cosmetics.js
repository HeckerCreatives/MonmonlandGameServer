const mongoose = require("mongoose");

const cosmeticsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        name: {
            type: String // diamond / pearl /  
        },
        type: {
            type: String  // ring / etc.
        },
        expiration: {
            type: String,   // unixtime / permanent
        },
        isequip: {
            type: String, // 0 & 1
        }
    },
    {
        timestamps: true
    }
)

const Cosmetics = mongoose.model("Cosmetics", cosmeticsSchema);
module.exports = Cosmetics