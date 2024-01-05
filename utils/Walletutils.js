const { default: mongoose } = require("mongoose")
const Gamewallet = require("../models/Wallets")
const Gameusers = require("../models/Gameusers")
const Wallethistory = require("../models/Wallethistory")

exports.checkwalletamount = async (amount, id) => {
    return await Gamewallet.findOne({owner: new mongoose.Types.ObjectId(id), wallettype: "balance"})
    .then(async data => {
        if (!data){
            return "notexist"
        }

        if (data.amount < amount){
            return "notenoughfunds"
        }

        await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: "balance"}, [{
            $set: {
                amount: {
                    $max: [0, {
                        $add: ["$amount", -amount]
                    }]
                }
            }
        }]).then(() => {
            return "success"
        })
        .catch(err => "bad-request")
    })
    .catch(err => "bad-request")
}

exports.sendcommissiontounilevel = async(commissionAmount, id) => {
    let response = ""
    await Gameusers.findOne({_id: id})
    .then(async sender => {

        const pipeline = [
            // Match the sender
            {
                $match: { _id: sender._id },
            },
            // GraphLookup to recursively traverse the referral chain
            {
                $graphLookup: {
                    from: 'gameusers',
                    startWith: '$referral',
                    connectFromField: 'referral',
                    connectToField: '_id',
                    as: 'referralChain',
                    maxDepth: 6, // Set the maximum depth to your needs
                    depthField: 'level',
                },
            },
            // Project to check the referral chain after the $graphLookup stage
            {
                $project: {
                    _id: 1,
                    referralChain: '$referralChain',
                },
            },
            // Unwind the referral chain array
            {
                $unwind: '$referralChain',
            },
            // Project to check the fields after the $unwind stage
            {
                $project: {
                    _id: '$referralChain._id',
                    level: '$referralChain.level',
                    originalCommissionPercentage: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$referralChain.level', 0] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.25]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.1]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 1] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.15]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.05]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 2] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.1]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.04]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 3] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.06]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.03]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 4] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.03]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.02]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 5] }, then: { $multiply: [commissionAmount, 0.01] } },
                            ],
                            default: 0,
                        },
                    },
                },
            },
            // Group to calculate the total commissionPercentage for each level
            {
                $group: {
                    _id: '$_id',
                    amount: { $sum: '$originalCommissionPercentage' },
                },
            },
        ];
        
        const unilevelresult = await Gameusers.aggregate(pipeline);

        const historypipeline = []

        unilevelresult.forEach(dataresult => {
            const { _id, amount } = dataresult

            historypipeline.push({owner: new mongoose.Types.ObjectId(_id), type: "Subscription Unilevel", description: "Subscription Unilevel", amount: amount, historystructure: `from userid: ${id} with amount of ${commissionAmount}`})
        })

        const bulkOperationUnilvl = unilevelresult.map(({_id, amount }) => ({
            updateOne: {
                filter: { owner: _id, wallettype: 'balance' },
                update: { $inc: { amount: amount}}
            }
        }))
        
        await Gamewallet.bulkWrite(bulkOperationUnilvl)
        .catch(() => response = "bad-request")
        await Wallethistory.insertMany(historypipeline)
        .catch(() => response = "bad-request")

        response = "success"
    })
    .catch(err => {
        response = "bad-request"
    })

    return response;
}