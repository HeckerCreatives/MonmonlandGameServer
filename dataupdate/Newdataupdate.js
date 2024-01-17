const { default: mongoose } = require("mongoose");
const { connecttodatabase, closedatabase } = require("./database")

exports.Tasksdataupdate = async () => {
    const client = await connecttodatabase();
    const database = client.db()

    const gameusers = database.collection("gameusers")
    const walletscutoff = database.collection("walletscutoffs")
    const gamewallets = database.collection("gamewallets")

    const users = gameusers.find()

    const userlist = await users.toArray()

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