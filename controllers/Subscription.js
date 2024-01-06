const { sendcommissiontounilevel, checkwalletamount } = require("../utils/Walletutils")
const { getsubsamount, getpooldetails } = require("../utils/Pooldetailsutils")
const { computecomplan } = require("../webutils/Communityactivityutils")
const Pooldetails = require("../models/Pooldetails")
const { default: mongoose } = require("mongoose")

exports.buysubscription = async (req, res) => {
    const { id } = req.user
    const { substype } = req.body

    if (substype != "Ruby" && substype != "Emerald" && substype != "Diamond"){
        return res.json({message: "subsnotexist"})
    }

    let subsamount = getsubsamount(substype);

    if (subsamount <= 0){
        return res.json({message: "subsamountiszero"})
    }

    const pooldetails = await getpooldetails(id)

    if (pooldetails == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (pooldetails == "erroraccount"){
        return res.json({ message: "erroraccount" })
    }

    const previoussubs = getsubsamount(pooldetails.subscription)

    if (substype == pooldetails.subscription){
        return res.json({message: "samesubs"})
    }
    
    const finalsubsamount = subsamount - previoussubs

    const checkwallet = await checkwalletamount(finalsubsamount, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    const sendcoms = await sendcommissiontounilevel(finalsubsamount, id);
    
    if (sendcoms == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (sendcoms == "success"){
        await Pooldetails.updateOne({owner: new mongoose.Types.ObjectId(id)}, [
            {
                $set: {
                    subscription: substype,
                    status: {
                        $cond: {
                            if: {
                                $eq: [substype, "Diamond"]
                            },
                            then: "Active",
                            else: "Inactive"
                        }
                    }
                }
            }
        ])
        .then(async () => {

            const complan = await computecomplan(finalsubsamount)

            if (complan != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            return res.json({message: "success"})
        })
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    }
    else{
        return res.json({message: "failed"})
    }

}