const { default: mongoose } = require("mongoose")
const Gamewallet = require("../models/Wallets")
const Gameusers = require("../models/Gameusers")
const Walletscutoff = require("../models/Walletscutoff")
const Wallethistory = require("../models/Wallethistory")
const Ingameleaderboard = require("../models/Leaderboard")
const Communityactivity = require("../modelweb/Communityactivity")
const Airdroptransaction = require("../modelweb/Airdroptransaction")
const Token = require("../modelweb/Token")
const { setleaderboard } = require("../utils/Leaderboards")

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

exports.getwalletamount = async (id, type) => {
    return await Gamewallet.findOne({owner: new mongoose.Types.ObjectId(id), wallettype: type})
    .then(data => data)
    .catch(err => "bad-request")
}

exports.getwalletcutoffamount = async (id, type) => {
    return await Walletscutoff.findOne({owner: new mongoose.Types.ObjectId(id), wallettype: type})
    .then(data => data)
    .catch(err => "bad-request")
}

exports.sendcommissiontounilevel = async(commissionAmount, id, substype) => {
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
                    maxDepth: 9, // Set the maximum depth to your needs
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
                                                $multiply: [commissionAmount, 0.40]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.15]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 1] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.25]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.07]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 2] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.18]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.05]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 3] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.13]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.04]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 4] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.09]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.03]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 5] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.06]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.02]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 6] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.04]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.01]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 7] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.03]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.01]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 8] }, then: { $cond: {
                                            if: { $eq: ['$referralChain._id', new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)]},
                                            then: {
                                                $multiply: [commissionAmount, 0.02]
                                            },
                                            else : {
                                                $multiply: [commissionAmount, 0.01]
                                            }
                                        } 
                                    }
                                },
                                { case: { $eq: ['$referralChain.level', 9] }, then: { $multiply: [commissionAmount, 0.01] } },
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
                    level: {$first: '$level'},
                    amount: { $sum: '$originalCommissionPercentage' },
                },
            },
        ];
        
        const unilevelresult = await Gameusers.aggregate(pipeline)
        .catch(err => console.log(err.message));

        const historypipeline = []

        let directreferralid = ""

        unilevelresult.forEach(dataresult => {
            const { _id, level, amount } = dataresult

            if (level == 0){
                directreferralid = _id
            }

            historypipeline.push({owner: new mongoose.Types.ObjectId(_id), type: "Subscription Unilevel", description: "Subscription Unilevel", amount: amount, historystructure: `from userid: ${id} with amount of ${commissionAmount}`})
        })

        const bulkOperationUnilvl = unilevelresult.map(({_id, amount }) => ({
            updateOne: {
                filter: { owner: _id, wallettype: 'balance' },
                update: { $inc: { amount: amount}}
            }
        }))

        //  DIRECT POINTS
        if (directreferralid != process.env.MONMONLAND_ID && directreferralid != ""){

            let pointsamount = 0;

            switch(substype){
                case "Pearl":
                    pointsamount = 0
                    break;
                case "Ruby":
                    pointsamount = 2
                    break;
                case "Emerald":
                    pointsamount = 6
                    break;
                case "Diamond":
                    pointsamount = 10
                    break;
                default:
                    pointsamount = 0
                    break;
            }
            
            await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(directreferralid), wallettype: "directpoints"}, {$inc: {amount: pointsamount}})
            .catch(err => {
                return "bad-request"
            })
            await Walletscutoff.findOneAndUpdate({owner: new mongoose.Types.ObjectId(directreferralid), wallettype: "directpoints"}, {$inc: {amount: pointsamount}})
            .catch(err => {
                return "bad-request"
            })

            const addleaderboard = await setleaderboard(directreferralid, pointsamount)

            if (addleaderboard != "success"){
                console.log("damn2")
                response = "bad-request"

                return;
            }
        }

        await Gamewallet.bulkWrite(bulkOperationUnilvl)
        .catch(err => {
            console.log(err.message)
            response = "bad-request"
        })
        await Wallethistory.insertMany(historypipeline)
        .catch(err => {
            console.log(err.message)
            response = "bad-request"
        })

        response = "success"
    })
    .catch(err => {
        console.log(err.message)
        response = "bad-request"
    })

    return response;
}

exports.sendmgtounilevel = async(commissionAmount, id, historytype, type, itemtype) => {
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
                equipmentData: datalevel.equipmentData,
                clockdata: datalevel.clockData
            }
        })

        let levelindex = 0;
        const bulkOperationUnilvl = []
        const bulkOperationCutoffLvl = []
        const historypipeline = []

        for(var a = 0; a < Object.keys(unilevelmg).length; a++){
            if (levelindex >= 9){
                break;
            }
            
            const ownedtools = await unilevelmg[a].equipmentData.length <= 0 ? false : unilevelmg[a].equipmentData.some(tooldata => tooldata.isowned == '1' && tooldata.type != '1');

            const ownedclocks = await unilevelmg[a].clockdata.length <= 0 ? false : unilevelmg[a].clockdata.some(clockdata => clockdata.isowned == '1')

            if (unilevelmg[a].owner == process.env.MONMONLAND_ID){
                
                let amount = 0;

                amount = commissionAmount * getremainingmglevelpercentage(levelindex)

                bulkOperationUnilvl.push({
                    updateOne: {
                        filter: { owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), wallettype: 'monstergemunilevel' },
                        update: { $inc: { amount: amount}}
                    }
                })

                historypipeline.push({owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), type: historytype, description: historytype, amount: amount, historystructure: `from userid: ${id} with amount of ${commissionAmount}`})

                break;
            }

            if (ownedtools || ownedclocks){

                let amount = 0;

                if (unilevelmg[a].owner == new mongoose.Types.ObjectId(process.env.MONMONLAND_ID)){
                    amount = commissionAmount * getremainingmglevelpercentage(levelindex)
                }
                else{
                    amount = commissionAmount * getmgunilevelpercentage(levelindex)
                }

                if (levelindex > 2){
                    bulkOperationUnilvl.push({
                        updateOne: {
                            filter: { owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), wallettype: 'grouppoints' },
                            update: { $inc: { amount: (getgrouppoints(itemtype, type) * (levelindex + 1))}}
                        }
                    })

                    bulkOperationCutoffLvl.push({
                        updateOne: {
                            filter: { owner: new mongoose.Types.ObjectId(unilevelmg[a].owner), wallettype: 'grouppoints' },
                            update: { $inc: { amount: (getgrouppoints(itemtype, type) * (levelindex + 1))}}
                        }
                    })
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

        //  POINTS
        const addlbpoints = await setleaderboard(id, getgrouppoints(itemtype, type))

        if (addlbpoints != "success"){
            return res.json({message: "bad-request"})
        }
        
        await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: "purchasepoints"}, {$inc: {amount: getgrouppoints(itemtype, type)}}).catch((err) => {
            console.log(err.message) 
            response = "bad-request"
            return
        })
        await Walletscutoff.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: "purchasepoints"}, {$inc: {amount: getgrouppoints(itemtype, type)}}).catch((err) => {
            console.log(err.message) 
            response = "bad-request"
            return
        })
        await Walletscutoff.bulkWrite(bulkOperationCutoffLvl)
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
    return await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: wallettype}, {$inc: {amount: amount}})
    .then(() => "success")
    .catch(err => {
        console.log(err.message, "addwallet amount failed")
        return "bad-request"
    })
}

exports.rebatestowallet = async (id, wallettype, amount, type) => {
    return await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: wallettype}, {$inc: {amount: amount}})
    .then(async () => {
        return await Wallethistory.create({owner: new mongoose.Types.ObjectId(id), description: `${type} Rebate`, amount: amount, historystructure: `Rebates from ${type}`})
        .then(() => "success")
        .catch(() => "bad-request")
    })
    .catch(err => {
        console.log(err.message, "addwallet amount failed")
        return "bad-request"
    })
}

exports.addpointswalletamount = async (id, wallettype, amount) => {
    return await Gamewallet.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: wallettype}, {$inc: {amount: amount}})
    .then(async () => {
        return await Walletscutoff.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), wallettype: wallettype}, {$inc: {amount: amount}})
        .then(() => {
            return "success"
        })
        .catch(err => {
            console.log(err.message, "addwallet amount failed")
            return "bad-request"
        })
    })
    .catch(err => {
        console.log(err.message, "addwallet amount failed")
        return "bad-request"
    })
}

function getmgunilevelpercentage(level){
    switch (level){
        case 0:
            return 0.19
        case 1:
            return 0.01
        case 2:
            return 0.01
        case 3: 
            return 0.01
        case 4:
            return 0.01
        case 5:
            return 0.01
        case 6:
            return 0.01
        case 7:
            return 0.01
        case 8:
            return 0.01
        case 9:
            return 0.01
    }
}

function getremainingmglevelpercentage(level){
    switch (level){
        case 0:
            return 0.19
        case 1:
            return 0.09
        case 2:
            return 0.08
        case 3: 
            return 0.07
        case 4:
            return 0.06
        case 5:
            return 0.05
        case 6:
            return 0.04
        case 7:
            return 0.03
        case 8:
            return 0.02
        case 9:
            return 0.01
    }
}

function getgrouppoints(itemtype, type){
    if (itemtype == "tools"){
        switch(type){
            case "2":
                return 6;
            case "3":
                return 9;
            case "4":
                return 12
            case "5":
                return 18
        }
    }
    else if (itemtype == "merchandise"){
        switch(type){
            case "1":
                return 10;
            case "2":
                return 20;
            case "3":
                return 30
            case "4":
                return 60
        }
    }
    else{
        return 0
    }
}

exports.addtoken = async (id, substype) => {
    let tokentoreceive = 0;
    switch(substype){
        case "Pearlplus":
            tokentoreceive = 100;
        break;
        case "Ruby":
            tokentoreceive = 200;
        break;
        case "Emerald":
            tokentoreceive = 500;
        break;
        case "Diamond":
            tokentoreceive = 1000;
        break;
        default:
        break;
    }
    

    return await Token.findOne({owner: id})
    .then(async token => {
        if(token){

            const history = {
                owner: id,
                type: "Subscription incentive MMT Token",
                description: "Subscription incentive MMT Token",
                amount: tokentoreceive,
                historystructure: "mmt token subscription incentive"
            }

            const airdrophistory = {
                owner: id,
                // questid: questid,
                questtitle: "Subscription Incentive",
                mmttokenreward: tokentoreceive,
                mcttokenreward: 0,
            }

            await Token.findOneAndUpdate({owner: id, type: "MMT"},{$inc: {amount: tokentoreceive}})
            await Wallethistory.create(history)
            await Airdroptransaction.create(airdrophistory)
            return 'success'
        } else {
            const createwallet = {
                owner: id,
                type: "MMT",
                amount: tokentoreceive
            }

            const history = {
                owner: id,
                type: "Subscription incentive MMT Token",
                description: "Subscription incentive MMT Token",
                amount: tokentoreceive,
                historystructure: "mmt token subscription incentive"
            }

            const airdrophistory = {
                owner: id,
                type: "MMT",
                tokereward: tokentoreceive
            }

            await Token.create(createwallet)
            await Wallethistory.create(history)
            await Airdroptransaction.create(airdrophistory)
            return 'success'
        }
    })
    .catch(err => {
        console.log(err.message, "addtoken amount failed")
        return "bad-request"
    })
}

exports.checkairdroplimit = async (tokentoreceive, tokentype) => {

    return await Airdroptransaction.find()
    .then(tokens => {
        const MMTTokens = tokens.filter(e => e.type === "MMT");
        const MCTTokens = tokens.filter(e => e.type === "MCT");

        const sumMMT = MMTTokens.reduce((acc, token) => acc + token.mmttokenreward, 0);
        const sumMCT = MCTTokens.reduce((acc, token) => acc + token.mcttokenreward, 0);

        if(tokentype == "MMT"){
            const tokentobeadd = sumMMT + parseFloat(tokentoreceive)
            const limit = 1000000

            if(tokentobeadd > limit){
                return 'limit'
            } else {
                return 'notlimit'
            }
        } else if (tokentype == "MCT"){
            const tokentobeadd = sumMCT + parseFloat(tokentoreceive)
            const limit = 10000000

            if(tokentobeadd > limit){
                return 'limit'
            } else {
                return 'notlimit'
            }

        } else {
            return "token not found"
        }

    })
    .catch(err => {
        console.log(err.message, "checkairdroplimit failed")
        return "bad-request"
    })
}