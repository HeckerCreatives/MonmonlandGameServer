const mongoose = require("mongoose");

const FiestaSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String,
        },
        amount: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true
    }
)

const Fiesta = mongoose.model("Fiesta", FiestaSchema);
module.exports = Fiesta