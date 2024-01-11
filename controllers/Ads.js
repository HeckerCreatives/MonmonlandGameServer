const EnergyInventory = require("../models/Energyinventory")
const { addpointswalletamount } = require("../utils/Walletutils")
const { setleaderboard } = require("../utils/Leaderboards")

exports.claimads = async (req, res) => {
    const { id } = req.user
    const { adstype } = req.body

    if (adstype >= 1 && adstype <= 3){
        let itemname = ""
        let itemtype = ""
        const qty = 1

        switch(adstype){
            case "1":
                itemname = "1"
                itemtype = "energy"
                break;
            case "2":
                itemname = "2"
                itemtype = "energy"
                break;
            case "3":
                itemname = "3"
                itemtype = "energy"
            default:
                return res.json({message: "noenergyitem"});
        }

        const grantwalletpoints = addpointswalletamount(id, "adspoints", 1)
        const grantlbpoints = await setleaderboard(id, 1)

        if (grantwalletpoints != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        if (grantlbpoints != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        await EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype})
        .then(async dataenergy => {
            if (!dataenergy){
                await EnergyInventory.create({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype, amount: qty, consumableamount: checkenergyinventoryconsumable(`${itemname}${itemtype}`)})
                .then(() => {
                    res.json({message: "success"})
                })
                .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    
                return
            }
    
            await EnergyInventory.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), name: itemname, type: itemtype}, {$inc: { amount: qty }})
            .then(() => {
                res.json({message: "success"})
            })
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
        })
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }
    else{
        res.status(400).json({ message: "bad-request" })
    }
}