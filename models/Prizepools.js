const mongoose = require("mongoose");

const PrizepoolSchema = new mongoose.Schema(
    {
        type: {
            type: String
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

const Prizepools = mongoose.model("Prizepools", PrizepoolSchema);
module.exports = Prizepools