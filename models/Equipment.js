const mongoose = require("mongoose");

const EquipmentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        isowned: {
            type: String,
        },
        expiration: {
            type: String,
        },
        isequip: {
            type: String,
        },
        
    },
    {
        timestamps: true
    }
)

const Equipment = mongoose.model("Equipment", EquipmentSchema);
module.exports = Equipment