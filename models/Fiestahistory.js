const mongoose = require("mongoose");

const FiestahistorySchema = new mongoose.Schema(
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
        },
    },
    {
        timestamps: true
    }
)

const Fiestahistory = mongoose.model("Fiestahistory", FiestahistorySchema);
module.exports = Fiestahistory