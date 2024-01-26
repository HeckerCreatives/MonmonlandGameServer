const Ingamegames = require("../models/Games")
const Playtimegrinding = require("../models/Playtimegrinding")
const Energy = require("../models/Energy")
const { gettoolsequip, checkalltoolsexpiration } = require("../utils/Toolexpiration")
const { checkmgtools, checkmgclock, mcmined, clockhoursadd, checkgameavailable, addtototalfarmmc, minustototalcoins, getfarm, getnumbergamespersubs, energyringmgvalue, prizepooladd, fiestarewards, getenergy } = require("../utils/Gameutils")
const { checkcosmeticequip, checkallcosmeticsexpiration } = require("../utils/Cosmeticutils")
const { getclockequip, checkallclockexpiration } = require("../utils/Clockexpiration")
const { getpooldetails } = require("../utils/Pooldetailsutils")
const { DateTimeGameExpiration, DateTimeServer, CalculateSecondsBetween, UnixtimeToDateTime, DateTimeGameExpirationMinutes } = require("../utils/Datetimetools")
const { addwalletamount, addpointswalletamount, checkmcwalletamount } = require("../utils/Walletutils")
const { default: mongoose } = require("mongoose")
const { setleaderboard, setfiestaleaderboard } = require("../utils/Leaderboards")
const { checkmaintenance } = require("../utils/Maintenance")
const Gameunlock = require("../models/Gameunlock")
const Supermonmon = require("../models/Supermonmon")
const EnergyInventory = require("../models/Energyinventory")
const Fiesta = require("../models/Fiesta")
const Prizepools = require("../models/Prizepools")
const Palosebo = require("../models/Palosebo")

exports.playgame = async (req, res) => {
    const { id } = req.user
    const { gametype } = req.body

    const maintenance = await checkmaintenance("maintenancegrinding")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

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

    mgtool = checkmgtools(toolsequip, `${cosmeticequip?.name == null ? "" : cosmeticequip.name}${cosmeticequip?.type == null ? "" : cosmeticequip.type }`)

    const clocksequip = await getclockequip(id)

    if (clocksequip == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    let timemultipliermg = 3;

    switch(clocksequip?.type == null ? -1 : clocksequip?.type){
        case "1":
            timemultipliermg = 6
            break;
        case "2":
            timemultipliermg = 9
            break;
        case "3":
            timemultipliermg = 12
            break;
        case "4":
            timemultipliermg = 15
            break;
        default:
            timemultipliermg = 3
            break;
    }

    let energyringmg = 0

    if (cosmeticequip){
        if (cosmeticequip.name == "Energy"){
            energyringmg = ((0.30 / 24) * timemultipliermg) / getnumbergamespersubs(pooldeets.subscription)
        }
    }

    mgclock = checkmgclock(clocksequip?.type == null ? 0 : clocksequip.type, pooldeets.subscription)
    let finalmg = (((mgtool + mgclock + energyringmg) / 24) * timemultipliermg) / getnumbergamespersubs(pooldeets.subscription);
    let monstercoin = mcmined(toolsequip, clocksequip?.type == null ? 0 : clocksequip.type)

    const expiredtime = DateTimeGameExpiration(clockhoursadd(clocksequip?.type == null ? 0 : clocksequip.type))
    
    //  Check energy
    const energyamount = await getenergy(id)

    if (energyamount == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (!energyamount){
        return res.json({message: "energynotexist"})
    }

    const energyconsumption = clockhoursadd(clocksequip?.type == null ? 0 : clocksequip.type)

    if (cosmeticequip){
        if (cosmeticequip.name != "Energy"){
            if (energyamount.amount < energyconsumption){
                return res.json({message: "notenoughenergy"})
            }
        }
    }
    else{
        if (energyamount.amount < energyconsumption){
            return res.json({message: "notenoughenergy"})
        }
    }

    let finalap = monstercoin;

    if (pooldeets.subscription != "Pearl"){
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
    }

    await Ingamegames.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: gametype}, { status: "playing", timestarted: DateTimeServer(), unixtime: expiredtime, harvestmc: monstercoin, harvestmg: finalmg, harvestap: finalap})
    .then(async data => {

        if (cosmeticequip){
            if (cosmeticequip.name != "Energy"){
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
            }
        }
        else{
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
        }
        
        return res.json({message: "success", mc: monstercoin, mg: finalmg, expiration: expiredtime, datetime: DateTimeServer()})
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

    const gameunlock = await Gameunlock.find({owner: new mongoose.Types.ObjectId(id), $or: [{type: "playall"}, {type: "claimall"}]})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (gameunlock.length <= 0){
        data["claimall"] = "0"
        data["playall"] = "0"
    }
    else{
        gameunlock.forEach(unlockdata => {
            data[unlockdata.type] = unlockdata.value
        })
    }

    return res.json({message: "success", data: data})
}

exports.claimgame = async (req, res) => {
    const { id } = req.user
    const { gametype } = req.body

    const maintenance = await checkmaintenance("maintenancegrinding")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

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
    const totalAPFarmed = getfarm(game.timestarted, game.unixtime, game.harvestap)

    if (pooldeets.subscription != "Pearl"){
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
    }

    await Ingamegames.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: gametype}, {status: "pending", timestarted: 0, unixtime: 0, harvestmc: 0, harvestmg: 0, harvestap: 0})
    .then(async () => {
        const mcadd = await addwalletamount(id, "monstercoin", totalMCFarmed)
        const mgadd = await addwalletamount(id, "monstergemfarm", totalMGFarmed)
        const apadd = await addpointswalletamount(id, "activitypoints", totalAPFarmed)
        const addlbpoints = await setleaderboard(id, totalAPFarmed)

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

        if (apadd != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        if (addlbpoints != "success"){
            return res.status(400).json({ message: "bad-request" })
        }

        finaldata = {
            datetime: DateTimeServer()
        }
        res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.playpalosebo = async (req, res) => {
    const { id } = req.user

    const maintenance = await checkmaintenance("maintenancefiestagame")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }
    
    return res.json({message: "success"})
}

exports.startpalosebo = async (req, res) => {
    const { id } = req.user

    const maintenance = await checkmaintenance("maintenancefiestagame")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }

    const energyamount = await getenergy(id)

    if (energyamount == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (!energyamount){
        return res.json({message: "energynotexist"})
    }

    if (energyamount < 1){
        return res.json({message: "notenoughenergy"})
    }

    const palosebodata = await Palosebo.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!palosebodata){
        return res.json({message: "nopalosebodata"})
    }

    const checkwallet = await checkmcwalletamount(10, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }
    
    const minus = await minustototalcoins("Monster Coin", 1)
    
    if (minus != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    const addtoprizepools = await prizepooladd(9, "palosebo")

    if (addtoprizepools == "notexist"){
        return res.json({message: "notexist"})
    }

    if (addtoprizepools == "bad-request"){
        return res.json({message: "bad-request"})
    }

    await Palosebo.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {endttime: DateTimeGameExpirationMinutes(5), starttime: DateTimeServer()})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    await Energy.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, [{
        $set: {
            amount: {
                $max: [0, {
                    $add: ["$amount", -1]
                }]
            }
        }
    }])
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const participation = await addpointswalletamount(id, "fiestaparticipation", 1)

    if (participation != "success"){
        return res.json({message: "bad-request"})
    }
    
    return res.json({message: "success"})
}

exports.endpalosebo = async (req, res) => {
    const { id } = req.user
    const { score } = req.body

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }

    const palosebodata = await Palosebo.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!palosebodata){
        return res.json({message: "nopalosebodata"})
    }

    if (palosebodata.starttime <= 0){
        return res.json({message: "gamenotstarted"})
    }

    const scorechecker = getfarm(palosebodata.starttime, palosebodata.endttime, 300)

    const finalscorechecker = 305 - scorechecker

    if (score > finalscorechecker){
        return res.json({message: "cheater", expectedscore: finalscorechecker, scoresend: score})
    }
    
    const finaldata = {}

    if (scorechecker > 0){
        const fiestalb = await setfiestaleaderboard(id, "palosebo", score)

        if (fiestalb != "success"){
            return res.json({message: "bad-request"})
        }
    }

    const prizes = await fiestarewards()
    if (prizes.message == "success"){
        if (prizes.type == "energy"){
            await EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), name: prizes.name, type: prizes.type})
            .then(async dataenergy => {
                if (!dataenergy){
                    await EnergyInventory.create({owner: new mongoose.Types.ObjectId(id), name: prizes.name, type: prizes.type, amount: 1, consumableamount: checkenergyinventoryconsumable(`${prizes.name}${prizes.name}`)})
                    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
                }

                await EnergyInventory.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), name: prizes.name, type: prizes.type}, {$inc: { amount: 1 }})
                .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
            })
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
        }
        else if (prizes.type == "monster coin"){
            const addtotalmc = await addtototalfarmmc(parseInt(prizes.name), 0)

            if (addtotalmc.message != "success"){
                return res.json({message: "failed"})
            }
        
            if (parseInt(prizes.name) > addtotalmc.mctobeadded){
                const mcadd = await addwalletamount(id, "monstercoin", addtotalmc.mctobeadded)
                if (mcadd != "success"){
                    return res.status(400).json({ message: "bad-request" })
                }
            }
            else{
                const mcadd = await addwalletamount(id, "monstercoin", parseInt(prizes.name))
                if (mcadd != "success"){
                    return res.status(400).json({ message: "bad-request" })
                }
            }
        }
    }

    finaldata["prizes"] = {
        name: prizes.name,
        type: prizes.type
    }

    await Palosebo.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {endttime: 0, starttime: 0})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const apadd = await addpointswalletamount(id, "activitypoints", 1)
    const addlbpoints = await setleaderboard(id, 1)

    if (apadd != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (addlbpoints != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    return res.json({message: "success", data: finaldata})
}

exports.paloseboleaderboard = async (req, res) => {
    return await Fiesta.find({type: "palosebo", amount: { $gt: 0 }})
    .populate({
        path: "owner",
        select: "username"
    })
    .sort({amount: -1})
    .limit(15)
    .then(async data => {
        if (data.length <= 0){
            return res.json({message: "success", data: {}})
        }

        const finaldata = {
            leaderboard: {}
        }

        index = 0;
        data.forEach(lbdata => {
            finaldata["leaderboard"][index] = {
                score: lbdata.amount,
                username: lbdata.owner.username
            }

            index++
        })

        const prizepool = await Prizepools.findOne({type: "palosebo"})
        .then(data => data)
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

        finaldata["prizepools"] = prizepool.amount;

        return res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.playsupermonmon = async (req, res) => {
    const { id } = req.user

    const maintenance = await checkmaintenance("maintenancefiestagame")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }
    
    return res.json({message: "success"})
}

exports.startsupermonmon = async (req, res) => {
    const { id } = req.user

    const maintenance = await checkmaintenance("maintenancefiestagame")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }

    const energyamount = await getenergy(id)

    if (energyamount == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (!energyamount){
        return res.json({message: "energynotexist"})
    }

    if (energyamount < 1){
        return res.json({message: "notenoughenergy"})
    }

    const supermonmondata = await Supermonmon.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!supermonmondata){
        return res.json({message: "nosupermonmondata"})
    }

    const checkwallet = await checkmcwalletamount(10, id)

    if (checkwallet == "notexist"){
        return res.json({message: "walletnotexist"})
    }

    if (checkwallet == "notenoughfunds"){
        return res.json({message: "notenoughfunds"})
    }

    if (checkwallet == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }
    
    const minus = await minustototalcoins("Monster Coin", 1)
    
    if (minus != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    const addtoprizepools = await prizepooladd(9, "supermonmon")

    if (addtoprizepools == "notexist"){
        return res.json({message: "notexist"})
    }

    if (addtoprizepools == "bad-request"){
        return res.json({message: "bad-request"})
    }
    
    await Supermonmon.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {starttime: DateTimeServer()})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
    
    const participation = await addpointswalletamount(id, "fiestaparticipation", 1)

    if (participation != "success"){
        return res.json({message: "bad-request"})
    }

    return res.json({message: "success"})
}

exports.endsupermonmon = async (req, res) => {
    const { id } = req.user
    const { score } = req.body

    const pooldeets = await getpooldetails(id)

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }

    const supermonmondata = await Supermonmon.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!supermonmondata){
        return res.json({message: "nosupermonmondata"})
    }

    if (supermonmondata.starttime <= 0){
        return res.json({message: "gamenotstarted"})
    }

    const scorechecker = DateTimeServer() - supermonmondata.starttime

    if (score > scorechecker){
        return res.json({message: "cheater"})
    }

    const fiestalb = await setfiestaleaderboard(id, "supermonmon", score)

    if (fiestalb != "success"){
        return res.json({message: "bad-request"})
    }

    const prizes = await fiestarewards()
    if (prizes.message == "success"){
        if (prizes.type == "energy"){
            await EnergyInventory.findOne({owner: new mongoose.Types.ObjectId(id), name: prizes.name, type: prizes.type})
            .then(async dataenergy => {
                if (!dataenergy){
                    await EnergyInventory.create({owner: new mongoose.Types.ObjectId(id), name: prizes.name, type: prizes.type, amount: 1, consumableamount: checkenergyinventoryconsumable(`${prizes.name}${prizes.name}`)})
                    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
                }

                await EnergyInventory.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), name: prizes.name, type: prizes.type}, {$inc: { amount: 1 }})
                .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
            })
            .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
        }
        else if (prizes.type == "monster coin"){
            const addtotalmc = await addtototalfarmmc(parseInt(prizes.name), 0)

            if (addtotalmc.message != "success"){
                return res.json({message: "failed"})
            }
        
            if (parseInt(prizes.name) > addtotalmc.mctobeadded){
                const mcadd = await addwalletamount(id, "monstercoin", addtotalmc.mctobeadded)
                if (mcadd != "success"){
                    return res.status(400).json({ message: "bad-request" })
                }
            }
            else{
                const mcadd = await addwalletamount(id, "monstercoin", parseInt(prizes.name))
                if (mcadd != "success"){
                    return res.status(400).json({ message: "bad-request" })
                }
            }
        }
    }

    await Supermonmon.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id)}, {starttime: 0})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    const apadd = await addpointswalletamount(id, "activitypoints", 1)
    const addlbpoints = await setleaderboard(id, 1)

    if (apadd != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    if (addlbpoints != "success"){
        return res.status(400).json({ message: "bad-request" })
    }

    const finaldata = {
        prizes: {
            name: prizes.name,
            type: prizes.type
        }
    }

    return res.json({message: "success", data: finaldata})
}

exports.supermonmonleaderboard = async (req, res) => {
    return await Fiesta.find({type: "supermonmon", amount: { $gt: 0 }})
    .populate({
        path: "owner",
        select: "username"
    })
    .sort({amount: -1})
    .limit(15)
    .then(async data => {
        if (data.length <= 0){
            return res.json({message: "success", data: {}})
        }

        const finaldata = {
            leaderboard: {}
        }

        index = 0;
        data.forEach(lbdata => {
            finaldata["leaderboard"][index] = {
                score: lbdata.amount,
                username: lbdata.owner.username
            }

            index++
        })

        const prizepool = await Prizepools.findOne({type: "supermonmon"})
        .then(data => data)
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

        finaldata["prizepools"] = prizepool.amount;

        return res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}

exports.playsponsor = async (req, res) => {
    const maintenance = await checkmaintenance("maintenancesponsor")

    if (maintenance == "1") {
        return res.json({message: "maintenance"})
    }

    if (pooldeets == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldeets == "bad-request"){
        return res.status(400).json({message: "bad-request"})
    }

    if (pooldeets.subscription == "Pearl"){
        return res.json({message: "restricted"})
    }

    return res.json({message: "success"})
}

// exports.startsponsor = async (req, res) => {

//     const maintenance = await checkmaintenance("maintenancesponsor")

//     if (maintenance == "1") {
//         return res.json({message: "maintenance"})
//     }

//     const pooldeets = await getpooldetails(id)

//     if (pooldeets == "erroraccount"){
//         return res.json({message: "erroraccount"})
//     }
//     else if (pooldeets == "bad-request"){
//         return res.status(400).json({message: "bad-request"})
//     }

//     if (pooldeets.subscription == "Pearl"){
//         return res.json({message: "restricted"})
//     }


// }