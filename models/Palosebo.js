const mongoose = require("mongoose");

const PaloseboSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        starttime: {
            type: Number,
            default: 0
        },
        endttime: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

const Palosebo = mongoose.model("Palosebo", PaloseboSchema);
module.exports = Palosebo