const { default: mongoose } = require("mongoose");
const Communityactivity = require("../modelweb/Communityactivity")

exports.computecomplan = async (amount) => {

    let response = ""
                
    const complan = (amount * 0.25)
    const leaderboards = (amount * 0.03)
    const grinding = (amount * 0.45)
    const diamondpools = (amount * 0.02)
    const devsshare = (amount * 0.02)
    const companyshare = (amount * 0.03)
    const officers = (amount * 0.05)
    const marketing = (amount * 0.03)
    const incentives = (amount * 0.02)
    const monstergem = (amount * 0.10)
    const tradepayin = (amount * 0.0)

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

exports.computemerchcomplan = async (amount) => {
    let response = ""
                
    const complan = (amount * 0.22)
    const leaderboards = (amount * 0.03)
    const grinding = (amount * 0.45)
    const diamondpools = (amount * 0.03)
    const devsshare = (amount * 0.05)
    const companyshare = (amount * 0.05)
    const officers = (amount * 0.05)
    const marketing = (amount * 0.02)
    const incentives = (amount * 0.05)
    const monstergem = (amount * 0.05)
    const tradepayin = (amount * 0.0)

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

exports.computeshopcomplan = async (amount) => {
    let response = ""
                
    const complan = (amount * 0.17)
    const leaderboards = (amount * 0.03)
    const grinding = (amount * 0.45)
    const diamondpools = (amount * 0.03)
    const devsshare = (amount * 0.05)
    const companyshare = (amount * 0.05)
    const officers = (amount * 0.05)
    const marketing = (amount * 0.02)
    const incentives = (amount * 0.05)
    const monstergem = (amount * 0.10)
    const tradepayin = (amount * 0.0)

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