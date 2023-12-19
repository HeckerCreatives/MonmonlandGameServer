const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
    {
        itemtype: {
            type: String
        },
        itemname: {
            type: String
        },
        consume: {
            type: Number,
        },
        
    },
    {
        timestamps: true
    }
)

const Shop = mongoose.model("Shop", ShopSchema);
module.exports = Shop