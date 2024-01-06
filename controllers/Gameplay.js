const Ingamegames = require("../models/Games")
const { gettoolsequip, checkalltoolsexpiration } = require("../utils/Toolexpiration")
const { checkmgtools, checkmgclock, mcmined, clockhoursadd, checkgameavailable, addtototalfarmmc, minustototalmc, getfarm } = require("../utils/Gameutils")
const { checkcosmeticequip, checkallcosmeticsexpiration } = require("../utils/Cosmeticutils")
const { getclockequip, checkallclockexpiration } = require("../utils/Clockexpiration")
const { getpooldetails } = require("../utils/Pooldetailsutils")
const { DateTimeGameExpiration, DateTimeServer } = require("../utils/Datetimetools")
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

    let mgtool = 0
    let mgclock = 0

    const toolsequip = await gettoolsequip(id)

    mgtool = checkmgtools(toolsequip, `${cosmeticequip.name || ""}${cosmeticequip.type || ""}`)

    const clocksequip = await getclockequip(id)

    if (clocksequip == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    mgclock = checkmgclock(clocksequip.type || 0, pooldeets.subscription)

    let finalmg = mgtool + mgclock
    let monstercoin = mcmined(toolsequip.type, clocksequip.type)

    const expiredtime = DateTimeGameExpiration(clockhoursadd(clocksequip.type)
    )

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

        return res.json({message: "success", mc: monstercoin, mg: finalmg, expiration: expiredtime})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.getgames = async (req, res) => {
    const { id } = req.user

    const games = await Ingamegames.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const gamelist = {}

    games.forEach(gamedata => {
        const { type, status, unixtime, harvestmc, harvestmg } = gamedata

        gamelist[type] = {
            status: status,
            unixtime: unixtime,
            harvestmc: harvestmc,
            harvestmg: harvestmg
        }
    })

    return res.json({message: "success", data: gamelist})
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

        const minus = await minustototalmc("Monster Coin", tobeminus)

        if (minus != "success"){
            return res.status(400).json({ message: "bad-request" })
        }
    }

    if (totalMGFarmed < game.harvestmg){
        const tobeminus = game.harvestmg - totalMGFarmed

        const minus = await minustototalmc("Monster Gem", tobeminus)

        if (minus != "success"){
            return res.status(400).json({ message: "bad-request" })
        }
    }

    await 

    await Ingamegames.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: gametype}, {status: "pending", timestarted: 0, unixtime: 0, harvestmc: 0, harvestmg: 0, harvestap: 0})
    .then(async () => {
        const mcadd = await addwalletamount(id, "balance", totalMCFarmed)
        const mgadd = await addwalletamount(id, "monstergemfarm", totalMCFarmed)

        if (mcadd != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        if (mgadd != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        res.json({message: "success"})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}