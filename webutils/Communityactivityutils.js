const { default: mongoose } = require("mongoose");
const Merchandise = require("../modelweb/Merchandise")
const Communityactivity = require("../modelweb/Communityactivity")

exports.computecomplan = async (amount) => {

    let response = ""
                
    const complan = (amount * 0.25)
    const devsshare = (amount * 0.02)
    const companyshare = (amount * 0.03)
    const grinding = (amount * 0.05)
    const monstergem = (amount * 0.05)
    const marketing = (amount * 0.03)
    const diamondpools = (amount * 0.02)
    const leaderboards = (amount * 0.03)
    const incentives = (amount * 0.02)
    const officers = (amount * 0.05)
    const tradepayin = (amount * 0.45)

    const bulkOperations = [
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.leaderboardsca)},
                update: { $inc: { amount: leaderboards }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.grindingca)},
                update: { $inc: { amount: grinding }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.diamondpoolsca)},
                update: { $inc: { amount: diamondpools }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.devsshareca)},
                update: { $inc: { amount: devsshare }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.companyshareca)},
                update: { $inc: { amount: companyshare }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.officersca)},
                update: { $inc: { amount: officers }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.marketingca)},
                update: { $inc: { amount: marketing }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.incentivesca)},
                update: { $inc: { amount: incentives }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.monstergemca)},
                update: { $inc: { amount: monstergem }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.tradepayin)},
                update: { $inc: { amount: tradepayin }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.complanpayin)},
                update: { $inc: { amount: complan }}
            }
        }
    ]

    await Communityactivity.bulkWrite(bulkOperations)
    .catch(() => {
        response = "bad-request"
        return
    })

    response = "success"

    return response
}

exports.computemerchcomplan = async (amount, itemtype) => {
    let response = ""

    await Merchandise.findOneAndUpdate({item: itemtype}, {$inc: {amount: amount}})
    .catch(() => {
        response = "bad-request"
        return
    })
                
    const complan = (amount * 0.22)
    const devsshare = (amount * 0.05)
    const companyshare = (amount * 0.05)
    const grinding = (amount * 0.05)
    const monstergem = (amount * 0.05)
    const marketing = (amount * 0.02)
    const diamondpools = (amount * 0.03)
    const leaderboards = (amount * 0.03)
    const incentives = (amount * 0.05)
    const officers = (amount * 0.05)
    const tradepayin = (amount * 0.40)

    const bulkOperations = [
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.leaderboardsca)},
                update: { $inc: { amount: leaderboards }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.grindingca)},
                update: { $inc: { amount: grinding }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.diamondpoolsca)},
                update: { $inc: { amount: diamondpools }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.devsshareca)},
                update: { $inc: { amount: devsshare }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.companyshareca)},
                update: { $inc: { amount: companyshare }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.officersca)},
                update: { $inc: { amount: officers }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.marketingca)},
                update: { $inc: { amount: marketing }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.incentivesca)},
                update: { $inc: { amount: incentives }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.monstergemca)},
                update: { $inc: { amount: monstergem }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.tradepayin)},
                update: { $inc: { amount: tradepayin }}
            }
        },
        {
            updateOne: {
                filter: { _id: new mongoose.Types.ObjectId(process.env.complanpayin)},
                update: { $inc: { amount: complan }}
            }
        }
    ]

    await Communityactivity.bulkWrite(bulkOperations)
    .catch(() => {
        response = "bad-request"
        return
    })

    response = "success"

    return response
}