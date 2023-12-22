const mongoose = require("mongoose");

const MonmoncoinSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        amount: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)

const Monmoncoin = mongoose.model("Monmoncoin", MonmoncoinSchema);

module.exports = Monmoncoin