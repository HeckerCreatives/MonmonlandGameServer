const { sendcommissiontounilevel, checkwalletamount, addwalletamount, getwalletamount, addtoken, checkairdroplimit } = require("../utils/Walletutils")
const { getsubsamount, getpooldetails } = require("../utils/Pooldetailsutils")
const { computecomplan } = require("../webutils/Communityactivityutils")
const Pooldetails = require("../models/Pooldetails")
const SubsAccumulated = require("../modelweb/SubsAccumulated")
const { default: mongoose } = require("mongoose")
const { checkmaintenance } = require("../utils/Maintenance")
const { addanalytics } = require("../utils/Analytics")
const Gameusers = require("../models/Gameusers")

exports.buysubscription = async (req, res) => {
    const { id } = req.user
    const { substype } = req.body

    const maintenance = await checkmaintenance("maintenancesubscription")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    if (substype != "Pearlplus" && substype != "Ruby" && substype != "Emerald" && substype != "Diamond"){
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

    const sendcoms = await sendcommissiontounilevel(finalsubsamount, id, substype);
    
    if (sendcoms == "bad-request"){
        console.log("fck")
        await addwalletamount(id, "balance", finalsubsamount)

        return res.status(400).json({ message: "bad-request" })
    }

    if (sendcoms == "success"){
        await Pooldetails.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, [
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
                    },
                    rank: "none"
                }
            }
        ])
        .then(async () => {
            const complan = await computecomplan(finalsubsamount)

            if (complan != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            const walletamount = await getwalletamount(id, "monstercoin")

            if (!walletamount){
                return res.json({message: "nowallet"})
            }

            await SubsAccumulated.findOneAndUpdate({subsname: substype.toLowerCase()}, {$inc: {amount: finalsubsamount}})
            .then(async () => {
                const analyticsadd = await addanalytics(id, `Buy Subscription (${substype})`, finalsubsamount)

                if (analyticsadd == "bad-request"){
                    return res.status(400).json({ message: "bad-requestasdfasd" })
                }

                if(pooldetails.subscription != "Pearl"){
                    return res.json({message: "success"})
                } else {
                    // activaaateee heeem
                    await Gameusers.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)},{status: "active"})

                    let tokentoreceive;
                    switch(substype){
                        case "Pearlplus":
                            tokentoreceive = 100;
                        case "Ruby":
                            tokentoreceive = 200;
                        case "Emerald":
                            tokentoreceive = 500;
                        case "Diamond":
                            tokentoreceive = 1000;
                        default:
                    }

                    const airdroplimit = await checkairdroplimit((tokentoreceive * 2), "MMT")
                    const directreferralid = await Gameusers.findOne({_id: new mongoose.Types.ObjectId(id)}).then(e => e.referral)
                    
                    if(airdroplimit == "bad-request"){
                        return res.status(400).json({ message: "bad-request" })
                    }

                    if(airdroplimit == 'notlimit'){
                        const addmmt = await addtoken(id, substype)

                        if(addmmt == "bad-request"){
                            return res.status(400).json({ message: "bad-request" })
                        }

                        if(addmmt == 'success'){
                            const addmmttoreferal = await addtoken(directreferralid, substype)

                            if(addmmttoreferal == "bad-request"){
                                return res.status(400).json({ message: "bad-request" })
                            }

                            return res.json({message: "success"})
                        }
                    } else {
                        return res.json({message: "success"})
                    }
                }

                
            })
            .catch(err => res.status(400).json({ message: "bad-request whaat", data: err.message }))
        })
        .catch(err => res.status(400).json({ message: "bad-request shiiit", data: err.message }))
    }
    else{
        await addwalletamount(id, "balance", finalsubsamount)
        return res.json({message: "failed"})
    }

}