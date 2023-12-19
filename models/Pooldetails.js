const mongoose = require("mongoose");

const PooldetailsSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        status: {
            type: String,
            default: 'inactive'

        },
        rank: {
            type: String,
            default: "none"
        },
        
    },
    {
        timestamps: true
    }
)

const Pooldetails = mongoose.model("Pooldetails", PooldetailsSchema);
module.exports = Pooldetails