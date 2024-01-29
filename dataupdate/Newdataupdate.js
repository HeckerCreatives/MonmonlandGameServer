const { default: mongoose } = require("mongoose");
const { connecttodatabase, closedatabase } = require("./database")
const { checkmgtools, checkmgclock } = require('../utils/Gameutils')

exports.Tasksdataupdate = async () => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const walletscutoff = database.collection("walletscutoffs")
    const gamewallets = database.collection("gamewallets")

    const userlistpipeline = [
        {
            $lookup: {
                from: "walletscutoffs", // Use the actual collection name
                localField: "_id",
                foreignField: "owner",
                as: "walletData"
            }
        },
        {
            $match: {
                $and: [
                    { "walletData": { $exists: true } },
                    {
                        "walletData": {
                            $not: {
                                $elemMatch: { wallettype: "fiestaparticipation" }
                            }
                        }
                    }
                ]
            }
        }
    ]

    const gameuserlist = await gameusers.aggregate(userlistpipeline)
    const userlist = await gameuserlist.toArray()

    // console.log(userlist)
    const walletscutoffBulkWrite = []
    const gamewalletsBulkWrite = []

    userlist.forEach(data => {
        
        walletscutoffBulkWrite.push({
            insertOne: {
                document: {
                    owner: new mongoose.Types.ObjectId(data._id),
                    wallettype: "fiestaparticipation",
                    amount: 0
                }
            }
        })
        walletscutoffBulkWrite.push({
            insertOne: {
                document: {
                    owner: new mongoose.Types.ObjectId(data._id),
                    wallettype: "sponsorparticipation",
                    amount: 0
                }
            }
        })

        gamewalletsBulkWrite.push({
            insertOne: {
                document: {
                    owner: new mongoose.Types.ObjectId(data._id),
                    wallettype: "sponsorparticipation",
                    amount: 0
                }
            }
        })
        gamewalletsBulkWrite.push({
            insertOne: {
                document: {
                    owner: new mongoose.Types.ObjectId(data._id),
                    wallettype: "fiestaparticipation",
                    amount: 0
                }
            }
        })
    })

    await walletscutoff.bulkWrite(walletscutoffBulkWrite)
    await gamewallets.bulkWrite(gamewalletsBulkWrite)

    console.log("done creating data for sponsor and fiesta task to all users")
}

exports.TaskGameUnlockUpdate = async() => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const tasks = database.collection("tasks")
    const gameunlocks = database.collection("gameunlocks")
    const users = gameusers.find()

    const userlist = await users.toArray()

    const gameunlockBulkWrite = []
    const taskBulWrite = []

    userlist.forEach(data => {
        const taskdatauser = [
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "1",
                value: "0"
            },
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "2",
                value: "0"
            },
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "3",
                value: "0"
            },
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "4",
                value: "0"
            },
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "5",
                value: "0"
            },
        ]

        const gameunlockdatauser = [
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "fiestagame",
                value: "0"
            },
            {
                owner: new mongoose.Types.ObjectId(data._id),
                type: "sponsorgame",
                value: "0"
            },
        ]

        taskdatauser.map(data => {
            taskBulWrite.push({
                insertOne: {
                    document: data
                }
            })
        })
        
        gameunlockdatauser.map(data => {
            gameunlockBulkWrite.push({
                insertOne: {
                    document: data
                }
            })
        })
    })

    await tasks.bulkWrite(taskBulWrite)
    await gameunlocks.bulkWrite(gameunlockBulkWrite)

    console.log("Done update for task and game unlocks data to all users")
}

exports.AddMissingTaskToUser = async () => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const tasks = database.collection("tasks")

    const userlistpipeline = [
        {
            $lookup: {
                from: 'tasks',  // Assuming your Tasks collection is named 'tasks'
                localField: '_id',
                foreignField: 'owner',
                as: 'tasks'
            }
        },
        {
            $match: {
                tasks: {
                    $size: 0  // Filter users with no tasks
                }
            }
        }
    ]

    const userlistaggregate = gameusers.aggregate(userlistpipeline)
    const userlistdata = await userlistaggregate.toArray()

    const taskBulkWrite = []

    userlistdata.forEach(data => {
        taskBulkWrite.push(
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "1",
                        value: "0"
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "2",
                        value: "0"
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "3",
                        value: "0"
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "4",
                        value: "0"
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "5",
                        value: "0"
                    }
                }
            }
        )
    })

    await tasks.bulkWrite(taskBulkWrite)

    await closedatabase();
}

exports.addsupermonmonuserdata = async() => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const supermonmons = database.collection("supermonmons")
    const fiestas = database.collection("fiestas")

    const userlistpipeline = [
        {
            $lookup: {
                from: 'supermonmons',  // Assuming your Tasks collection is named 'tasks'
                localField: '_id',
                foreignField: 'owner',
                as: 'supermonmon'
            }
        },
        {
            $match: {
                supermonmon: {
                    $size: 0  // Filter users with no tasks
                }
            }
        }
    ]

    const userlistaggregate = gameusers.aggregate(userlistpipeline)
    const userlistdata = await userlistaggregate.toArray()

    const supermonmonBulkWrite = []
    const fiestaBulkWrite = []

    userlistdata.forEach(data => {
        supermonmonBulkWrite.push(
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        starttime: 0
                    }
                }
            },
        )

        fiestaBulkWrite.push(
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "supermonmon",
                        amount: 0
                    }
                }
            }
        )
    })

    await supermonmons.bulkWrite(supermonmonBulkWrite)
    await fiestas.bulkWrite(fiestaBulkWrite)

    await closedatabase();
}

exports.addpalosebodata = async() => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const palosebos = database.collection("palosebos")
    const fiestas = database.collection("fiestas")

    const userlistpipeline = [
        {
            $lookup: {
                from: 'palosebos',  // Assuming your Tasks collection is named 'tasks'
                localField: '_id',
                foreignField: 'owner',
                as: 'palosebo'
            }
        },
        {
            $match: {
                palosebo: {
                    $size: 0  // Filter users with no tasks
                }
            }
        }
    ]

    const userlistaggregate = gameusers.aggregate(userlistpipeline)
    const userlistdata = await userlistaggregate.toArray()

    const paloseboBulkWrite = []
    const fiestaBulkWrite = []

    userlistdata.forEach(data => {
        paloseboBulkWrite.push(
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        starttime: 0,
                        endttime: 0
                    }
                }
            },
        )

        fiestaBulkWrite.push(
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        type: "palosebo",
                        amount: 0
                    }
                }
            }
        )
    })

    await palosebos.bulkWrite(paloseboBulkWrite)
    await fiestas.bulkWrite(fiestaBulkWrite)

    await closedatabase();
}

exports.recomputemg = async() => {
    
    console.log("START RECOMPUTE MG")
    
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const clocks = database.collection("clocks")
    const equipment = database.collection("equipment")
    const cosmetics = database.collection("cosmetics")
    const gamewallets = database.collection("gamewallets")
    const ingamegames = database.collection("ingamegames")
    const monmoncoins = database.collection("monmoncoins")

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const gameuserpipeline = [
        {
            $match: {
                username: { $ne: "monmonland" }
            }
        },
        {
            $lookup: {
                from: 'pooldetails',
                localField: '_id',
                foreignField: 'owner',
                as: 'pooldetails'
            }
        },
        {
            $unwind: {
                path: '$pooldetails',
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                username: 1,
                subscription: '$pooldetails.subscription'
            }
        }
    ]

    const gameuserslist = await gameusers.aggregate(gameuserpipeline);

    
    console.log("GETTING USER LIST")
    const gameusersdatalist = await gameuserslist.toArray();

    const clockspipeline = [
        {
            $match: {
                createdAt: { $lte: yesterday },
                isowned: "1",
                isequip: "1"
            },
        },
        {
            $group: {
                _id: '$owner',
                user: { $first: '$owner' },
                totalDays: {
                    $sum: {
                        $trunc: {
                            $divide: [
                                { $subtract: [yesterday, '$createdAt'] },
                                1000 * 60 * 60 * 24, // milliseconds to days conversion
                            ],
                        },
                    },
                },
                type: { $first: "$type" }
            },
        },
    ]

    const clocksagg = await clocks.aggregate(clockspipeline)
    
    console.log("GETTING CLOCKS LIST")
    const clocksdata = await clocksagg.toArray()

    const toolspipeline = [
        {
            $match: {
                createdAt: { $lte: yesterday },
                isowned: "1",
                isequip: "1",
                type: { $ne: "1" }
            },
        },
        {
            $group: {
                _id: '$owner',
                user: { $first: '$owner' },
                totalDays: {
                    $sum: {
                        $trunc: {
                            $divide: [
                                { $subtract: [yesterday, '$createdAt'] },
                                1000 * 60 * 60 * 24, // milliseconds to days conversion
                            ],
                        },
                    },
                },
                type: { $first: "$type" }
            },
        },
    ]

    const toolssagg = await equipment.aggregate(toolspipeline)
    
    console.log("GETTING TOOLS LIST")
    const toolsdata = await toolssagg.toArray()

    const cosmeticspipeline = [
        {
            $match: {
                isequip: "1"
            }
        }
    ]

    const cosmeticssagg = await cosmetics.aggregate(cosmeticspipeline)
    
    console.log("GETTING COSMETICS LIST")
    const cosmeticsdata = await cosmeticssagg.toArray()

    const ingamegamespipeline = [
        {
            $match: {
                status: "playing"
            }
        },
        {
            $group: {
                _id: null,
                totalHarvestMG: { $sum: '$harvestmg' }
            }
        }
    ]

    const gamesagg = await ingamegames.aggregate(ingamegamespipeline)
    
    console.log("GETTING IN GAME GAMES TOTAL HARVEST MG")
    const gameshcdata = await gamesagg.toArray()

    const mgfarmed = []

    let webtotalmg = 0;

    
    console.log("SETTING UP QUERIES TO ALL USERS")
    gameusersdatalist.forEach(users => {
        let totalmgfarm = 0;
        
        clocksdata.forEach(clocksuser => {
            if (clocksuser.user == (users._id).toString()){
                totalmgfarm += (checkmgclock(clocksuser.type, users.subscription) * clocksuser.totalDays)
            }
        })

        let cosmeticstype = ""

        cosmeticsdata.forEach(cosmtcsdata => {
            if (cosmtcsdata.owner == (users._id).toString()){
                cosmeticstype = cosmtcsdata.name + cosmtcsdata.type
            }
        })

        toolsdata.forEach(toolsuser => {
            if (toolsuser.user == (users._id).toString()){
                totalmgfarm += (checkmgtools(toolsuser.type, cosmeticstype) * toolsuser.totalDays)
            }
        })

        mgfarmed.push({
            updateOne: {
                filter: { owner: users._id, wallettype: 'monstergemfarm'},
                update: { amount: totalmgfarm }
            }
        })

        webtotalmg += totalmgfarm
    })

    webtotalmg += gameshcdata[0].totalHarvestMG
    
    console.log("START SAVING")
    await gamewallets.bulkWrite(mgfarmed)
    await monmoncoins.updateOne({name: "Monster Gem"}, { $set: { amount: webtotalmg }})

    console.log("DONE RECOMPUTE MG")
}

exports.dailylimtads = async() => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const dailylimitschemas = database.collection("dailylimitschemas")

    const userlistpipeline = [
        {
            $lookup: {
                from: "dailylimitschemas", // Use the actual collection name
                localField: "_id",
                foreignField: "owner",
                as: "dailylimit"
            }
        },
        {
            $match: {
                $and: [
                    { "dailylimit": { $exists: true } },
                    {
                        "dailylimit": {
                            $not: {
                                $elemMatch: { wallettype: "watchads" }
                            }
                        }
                    }
                ]
            }
        }
    ]

    const gameuserlist = await gameusers.aggregate(userlistpipeline)
    const userlist = await gameuserlist.toArray()

    const dailylimitschemasBulkWrite = []

    userlist.forEach(data => {
        
        dailylimitschemasBulkWrite.push(
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        wallettype: "1watchads",
                        amount: 0
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        wallettype: "2watchads",
                        amount: 0
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        wallettype: "3watchads",
                        amount: 0
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        wallettype: "4watchads",
                        amount: 0
                    }
                }
            },
            {
                insertOne: {
                    document: {
                        owner: new mongoose.Types.ObjectId(data._id),
                        wallettype: "5watchads",
                        amount: 0
                    }
                }
            }
        )
    })

    await dailylimitschemas.bulkWrite(dailylimitschemasBulkWrite)

    console.log("done creating limit ads")
}