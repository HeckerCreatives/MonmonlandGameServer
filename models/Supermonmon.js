const mongoose = require("mongoose");

const SupermonmonSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        starttime: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
)

const Supermonmon = mongoose.model("Supermonmon", SupermonmonSchema);
module.exports = Supermonmon