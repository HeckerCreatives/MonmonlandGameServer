const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String // mmt or mct
        },
        amount: {
            type: Number, // token amount
        },
    },
    {
        timestamps: true
    }
)

const Token = mongoose.model("Token", TokenSchema);
module.exports = Token