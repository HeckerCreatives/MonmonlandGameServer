const EnergyInventory = require("../models/Energyinventory")
const { addpointswalletamount, getwalletcutoffamount } = require("../utils/Walletutils")
const { setleaderboard } = require("../utils/Leaderboards")
const { default: mongoose } = require("mongoose")
const { checkenergyinventoryconsumable } = require("../utils/Energyutils")
const { getpooldetails } = require("../utils/Pooldetailsutils")

exports.claimads = async (req, res) => {
    const { id } = req.user
    const { adstype } = req.body

    if (adstype >= 1 && adstype <= 5){
        let itemname = ""
        let itemtype = ""
        let qty = 1

        const pooldeets = await getpooldetails(id)

        if (pooldeets == "erroraccount"){
            return res.json({message: "erroraccount"})
        }
        else if (pooldeets == "bad-request"){
            return res.status(400).json({message: "bad-request"})
        }

        const cutoffbalance = await getwalletcutoffamount(id, "adspoints")

        if (cutoffbalance == "bad-request"){
            return res.status(400).json({ message: "bad-request" })
        }
        
        switch(adstype){
            case "1":
                itemname = "1"
                itemtype = "energy"
                break;
            case "2":
                itemname = "2"
                itemtype = "energy"
                qty = 2
                break;
            case "3":
                itemname = "3"
                itemtype = "energy"
                qty = 3
                break;
            case "4":
                itemname = "4"
                itemtype = "energy"
                break;
            case "5":
                itemname = "5"
                itemtype = "energy"
                break;
            default:
                return res.json({message: "noenergyitem"});
        }

        let limit = 0;

        switch(pooldeets.subscription){
            case "Pearl":
                limit = 500;
            break;
            case "Ruby":
                limit = 1000;
            break;
            case "Emerald":
                limit = 2000;
            break;
            case "Diamond":
                limit = 4000;
            break;
            default:
                limit = 0;
            break;
        }

        if (cutoffbalance.amount < limit){
            const grantwalletpoints = await addpointswalletamount(id, "adspoints", 1)
            const grantlbpoints = await setleaderboard(id, 1)
    
    
            if (grantwalletpoints != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
    
            if (grantlbpoints != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
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