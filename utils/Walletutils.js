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

exports.checkmcwalletamount = async (amount, id) => {
    return await Gamewallet.findOne({owner: new mongoose.Types.ObjectId(id), wallettype: "monstercoin"})
    .then(async data => {
        if (!data){
            return "notexist"
        }

        if (data.amount < amount){
            return "notenoughfunds"
        }

        await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: "monstercoin"}, [{
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

exports.sendmgtounilevel = async(commissionAmount, id, historytype) => {
    let response = ""
    await Gameusers.findOne({_id: id})
    .then(async sender => {

        const pipeline = [
            // Match the sender
            {
                $match: { _id: sender._id },
            },
            {
                $graphLookup: {
                    from: 'gameusers',
                    startWith: '$referral',
                    connectFromField: 'referral',
                    connectToField: '_id',
                    depthField: 'level',
                    as: 'referralTree'
                }
            },
            {
                $unwind: '$referralTree'
            },
            {
                $replaceRoot: { newRoot: '$referralTree' }
            },
            {
                $lookup: {
                    from: 'equipment', // Adjust to your actual collection name
                    localField: '_id',
                    foreignField: 'owner',
                    as: 'equipmentData',
                },
            },
            {
                $unwind: {
                    path: '$equipmentData',
                    preserveNullAndEmptyArrays: true,
                },
            },
        
            // Unwind the nested array inside equipmentData
            {
                $unwind: {
                    path: '$equipmentData',
                    preserveNullAndEmptyArrays: true,
                },
            },
        
            // Group after double unwind to eliminate duplicates
            {
                $group: {
                    _id: '$_id',
                    username: { $first: '$username' },
                    level: { $first: '$level' },
                    // ... (add other fields)
                    equipmentData: { $addToSet: '$equipmentData' },
                },
            },
            {
                $lookup: {
                    from: 'clocks', // Adjust to your actual collection name
                    localField: '_id',
                    foreignField: 'owner',
                    as: 'clockData',
                },
            },
            {
                $unwind: {
                    path: '$clockData',
                    preserveNullAndEmptyArrays: true,
                },
            },
        
            // Unwind the nested array inside equipmentData
            {
                $unwind: {
                    path: '$clockData',
                    preserveNullAndEmptyArrays: true,
                },
            },
        
            // Group after double unwind to eliminate duplicates
            {
                $group: {
                    _id: '$_id',
                    username: { $first: '$username' },
                    level: { $first: '$level' },
                    // ... (add other fields)
                    equipmentData: { $first: '$equipmentData' },
                    clockData: { $addToSet: '$clockData'}
                },
            },
        ];
        
        const unilevelresult = await Gameusers.aggregate(pipeline)
        .catch(err => {
            response = "bad-request"
            return
        });

        const unilevelmg = {}

        await unilevelresult.forEach(datalevel => {
            unilevelmg[datalevel.level] = {
                owner: new mongoose.Types.ObjectId(datalevel._id),
                equipmentData: datalevel.equipmentData
            }
        })

        let levelindex = 0;
        const bulkOperationUnilvl = []
        const historypipeline = []

        for(var a = 0; a < Object.keys(unilevelmg).length; a++){
            if (levelindex >= 5){
                break;
            }
            
            const ownedtools = unilevelmg[a].equipmentData.some(tooldata => tooldata.isowned == '1' && tooldata.type != '1');

            const ownedclocks = unilevelmg[a].clockdata == null ? false : unilevelmg[a].clockData.some(clockdata => clockdata.isowned == '1')

            if (ownedtools || ownedclocks){

                let amount = 0;

                if (unilevelmg[a].owner == new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)){
                    amount = commissionAmount * getremainingmglevelpercentage(levelindex)
                }
                else{
                    amount = commissionAmount * getmgunilevelpercentage(levelindex)
                }

                bulkOperationUnilvl.push({
                    updateOne: {
                        filter: { owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), wallettype: 'monstergemunilevel' },
                        update: { $inc: { amount: amount}}
                    }
                })

                historypipeline.push({owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), type: historytype, description: historytype, amount: amount, historystructure: `from userid: ${id} with amount of ${commissionAmount}`})

                levelindex++;
            }
            else
            {
                const amount = commissionAmount * getmgunilevelpercentage(levelindex);
                historypipeline.push({owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), type: `Missed ${historytype}`, description: `Missed ${historytype}`, amount: amount, historystructure: `from userid: ${id} with amount of ${commissionAmount}`})
            }
        }

        await Gamewallet.bulkWrite(bulkOperationUnilvl)
        .catch((err) => {
            console.log(err.message) 
            response = "bad-request"
            return
        })
        await Wallethistory.insertMany(historypipeline)
        .catch(() => response = "bad-request")

        response = "success"
    })
    .catch(err => {
        console.log(err.message) 
        response = "bad-request"
    })

    return response;
}

exports.addwalletamount = async (id, wallettype, amount) => {
    console.log(amount)
    return await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: wallettype}, {$inc: {amount: amount}})
    .then(() => "success")
    .catch(err => {
        console.log(err.message, "addwallet amount failed")
        return "bad-request"
    })
}

function getmgunilevelpercentage(level){
    switch (level){
        case 0:
            return 0.06
        case 1:
            return 0.04
        case 2:
            return 0.03
        case 3: 
            return 0.02
        case 4:
            return 0.01
        case 5:
            return 0.01
    }
}

function getremainingmglevelpercentage(level){
    switch (level){
        case 0:
            return 0.17
        case 1:
            return 0.11
        case 2:
            return 0.07
        case 3: 
            return 0.04
        case 4:
            return 0.03
        case 5:
            return 0.01
    }
}