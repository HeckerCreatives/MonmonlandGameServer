const mongoose = require("mongoose");

const sponsorlistschema = new mongoose.Schema(
    {
        itemnumber: {
            type: Number
        },
        itemname: {
            type: String // PS5, Ring of Energy 5 days, etc.
        },
        itemtype: {
            type: String // energy, ring, monstercoin, monstergem, balance, button, grandjackpot (DROP DOWN)
        },
        itemid: {
            type: String // energy (1, 2, 3, 4 ,5), tools (2, 3, 4 , 5), clocks (1, 2, 3, 4), etc.
        },
        amount: {
            type: Number // lalagyan lang to if monstercoin, monstegem, balance, etc.
        },
        expiration: {
            type: Number // lalagyan lang to if tools, clocks, cosmetics
        },
        qty: {
            type: Number // lalagyan lang to if energy (x2 energy type 1)
        },
        percentage: {
            type: Number // 0 to 1, 1 is 100%, 0.5 is 50%
        },
        isprize: {
            type: String // "1" or "0"
        }
    },
    {
        timestamps: true
    }
)

const Sponsorlist = mongoose.model("Sponsorlist", sponsorlistschema);
module.exports = Sponsorlist