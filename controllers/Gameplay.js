const Ingamegames = require("../models/Games")
const Playtimegrinding = require("../models/Playtimegrinding")
const Energy = require("../models/Energy")
const { gettoolsequip, checkalltoolsexpiration } = require("../utils/Toolexpiration")
const { checkmgtools, checkmgclock, mcmined, clockhoursadd, checkgameavailable, addtototalfarmmc, minustototalcoins, getfarm } = require("../utils/Gameutils")
const { checkcosmeticequip, checkallcosmeticsexpiration } = require("../utils/Cosmeticutils")
const { getclockequip, checkallclockexpiration } = require("../utils/Clockexpiration")
const { getpooldetails } = require("../utils/Pooldetailsutils")
const { DateTimeGameExpiration, DateTimeServer, CalculateSecondsBetween, UnixtimeToDateTime } = require("../utils/Datetimetools")
const { addwalletamount } = require("../utils/Walletutils")
const { default: mongoose } = require("mongoose")

exports.playgame = async (req, res) => {
    const { id } = req.user
    const { gametype } = req.body

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    const checkgame = checkgameavailable(pooldeets.subscription, gametype)

    if (checkgame == "restricted"){
        return res.json({message: "restricted"})
    }

    await checkalltoolsexpiration(id)
    await checkallclockexpiration(id)
    await checkallcosmeticsexpiration(id)

    const checkgameplay = await Ingamegames.findOne({owner: new mongoose.Types.ObjectId(id), type: gametype, status: "Playing"})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (checkgameplay){
        return res.json({message: "alreadyplaying"})
    }

    const cosmeticequip = await checkcosmeticequip(id)

    if (cosmeticequip == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    let finalmg = 0;

    const toolsequip = await gettoolsequip(id)

    const clocksequip = await getclockequip(id)

    if (clocksequip == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    let monstercoin = mcmined(toolsequip, clocksequip.type)

    const expiredtime = DateTimeGameExpiration(clockhoursadd(clocksequip.type))
    
    //  Check energy
    const energyamount = await Energy.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data.amount)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!energyamount){
        return res.json({message: "energynotexist"})
    }

    const energyconsumption = clockhoursadd(clocksequip.type)

    if (energyamount < energyconsumption){
        return res.json({message: "notenoughenergy"})
    }

    const addtotalmc = await addtototalfarmmc(monstercoin, finalmg)

    if (addtotalmc.message != "success"){
        return res.json({message: "failed"})
    }

    if (monstercoin > addtotalmc.mctobeadded){
        monstercoin = addtotalmc.mctobeadded
    }

    if (finalmg > addtotalmc.mgtobeadded){
        finalmg = addtotalmc.mgtobeadded
    }

    await Ingamegames.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: gametype}, { status: "playing", timestarted: DateTimeServer(), unixtime: expiredtime, harvestmc: monstercoin, harvestmg: finalmg})
    .then(async data => {

        await Energy.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, [{
            $set: {
                amount: {
                    $max: [0, {
                        $add: ["$amount", -energyconsumption]
                    }]
                }
            }
        }])
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
        
        return res.json({message: "success", mc: monstercoin, mg: finalmg, expiration: expiredtime})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.getgames = async (req, res) => {
    const { id } = req.user

    const result = await Ingamegames.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(id)
          },
        },
        {
          $lookup: {
            from: 'playtimegrindings', // the name of the Playtime collection
            let: { ownerId: '$owner', gameType: '$type' },
            pipeline: [
                {
                $match: {
                    $expr: {
                    $and: [
                        { $eq: ['$owner', '$$ownerId'] },
                        { $eq: ['$type', '$$gameType'] },
                    ],
                    },
                },
                },
            ],
            as: 'playtime',
          },
        },
        {
          $unwind: {
            path: '$playtime',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 0,
            type: 1,
            status: 1,
            timestarted: 1,
            unixtime: 1,
            harvestmc: 1,
            harvestmg: 1,
            harvestap: 1,
            playtime: {
              $ifNull: ['$playtime.currenttime', 0]
            },
          },
        },
      ]);

      let data = {}

      result.forEach(gameslist => {
        const { type, status, unixtime, harvestmc, harvestmg, harvestap, timestarted, playtime } = gameslist;
        
        data[type] = {
            status: status,
            unixtime: unixtime,
            harvestmc: harvestmc,
            harvestmg: harvestmg,
            harvestap: harvestap,
            timestarted: timestarted,
            playtime: playtime
        }
      })

    return res.json({message: "success", data: data})
}

exports.claimgame = async (req, res) => {
    const { id } = req.user
    const { gametype } = req.body

    const game = await Ingamegames.findOne({owner: new mongoose.Types.ObjectId(id), type: gametype})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!game){
        return res.json({message: "gamenotexist"})
    }

    if (game.status != "playing"){
        return res.json({message: "notplaying"})
    }

    const totalMCFarmed = getfarm(game.timestarted, game.unixtime, game.harvestmc)
    const totalMGFarmed = getfarm(game.timestarted, game.unixtime, game.harvestmg)

    if (totalMCFarmed < game.harvestmc){
        const tobeminus = game.harvestmc - totalMCFarmed

        const minus = await minustototalcoins("Monster Coin", tobeminus)

        if (minus != "success"){
            return res.status(400).json({ message: "bad-request" })
        }
    }

    if (totalMGFarmed < game.harvestmg){
        const tobeminus = game.harvestmg - totalMGFarmed

        const minus = await minustototalcoins("Monster Gem", tobeminus)

        if (minus != "success"){
            return res.status(400).json({ message: "bad-request" })
        }
    }

    // await 

    await Ingamegames.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: gametype}, {status: "pending", timestarted: 0, unixtime: 0, harvestmc: 0, harvestmg: 0, harvestap: 0})
    .then(async () => {
        const mcadd = await addwalletamount(id, "monstercoin", totalMCFarmed)
        const mgadd = await addwalletamount(id, "monstergemfarm", totalMGFarmed)

        const endexpirationtime = UnixtimeToDateTime(DateTimeServer() > game.unixtime ? game.unixtime : DateTimeServer())
        const startgrindtime = UnixtimeToDateTime(game.timestarted);

        const finalsecondspassed = CalculateSecondsBetween(startgrindtime, endexpirationtime)

        await Playtimegrinding.updateOne({owner: new mongoose.Types.ObjectId(id), type: gametype}, {$inc: {currenttime: finalsecondspassed}})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

        if (mcadd != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        if (mgadd != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        res.json({message: "success", mcfarmed: totalMCFarmed, mgfarmed: totalMGFarmed})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}