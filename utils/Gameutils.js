const Communityactivity = require("../modelweb/Communityactivity")
const Ads = require("../modelweb/Ads")
const Gameactivity = require("../modelweb/Gameactivity")
const Investorfunds = require("../modelweb/Investorfunds")
const Monmoncoin = require("../modelweb/Monmoncoin")
const Prizepools = require("../models/Prizepools")
const Energy = require("../models/Energy")
const { default: mongoose } = require("mongoose")

exports.checkmgtools = (tooltype, cosmetics) => {
    let mgamount = 0;
    
    if (cosmetics == "Diamondring" || cosmetics == "Energyring"){
        switch(tooltype) {
            case "2":
                mgamount = 0.35;
                break;
            case "3":
                mgamount = 0.70;
                break;
            case "4":
                mgamount = 1;
                break;
            case "5":
                mgamount = 1.20;
                break;
            default:
                mgamount = 0;
                break;
        }
    }
    else{
        switch(tooltype) {
            case "2":
                mgamount = 0.20;
                break;
            case "3":
                mgamount = 0.40;
                break;
            case "4":
                mgamount = 0.55;
                break;
            case "5":
                mgamount = 0.80;
                break;
            default:
                mgamount = 0;
                break;
        }
    }

    return mgamount;
}

exports.energyringmgvalue = (cosmetics) => {
    const rand = Math.floor(Math.random() * (700 - 1 + 1)) + 1;

    if (cosmetics == "Energyring"){
        if (rand == 1){
            return 0.5
        }
        else{
            return 0
        }
    }
    else{
        return 0
    }
}

exports.getnumbergamespersubs = (substype) => {
    const number = {
        Pearl: 1,
        Pearlplus: 1,
        Ruby: 3,
        Emerald: 5,
        Diamond: 7
    }

    return (number[substype] && number[substype]) || 0;
}

exports.checkmgclock = (clocktype, substype) => {
    const pricingInfo = {
        Pearl: 0,
        Pearlplus: 0,
        Ruby: {
          1: 0.70,
          2: 1.20,
          3: 1.70,
          4: 2.00,
          default: 0
        },
        Emerald: {
          1: 0.75,
          2: 1.25,
          3: 1.75,
          4: 2.25,
          default: 0
        },
        Diamond: {
          1: 0.80,
          2: 1.30,
          3: 1.85,
          4: 2.40,
          default: 0
        }
      };
    
      return (pricingInfo[substype] && pricingInfo[substype][clocktype]) || 0;
}

exports.clockhoursadd = (clocktype) => {

    const clockhours = {
        1: 6,
        2: 9,
        3: 12,
        4: 15
    }

    return clockhours[clocktype] || 3
}

exports.energygrindconsumption = (clocktype) => {

    const clockhours = {
        1: 12,
        2: 18,
        3: 24,
        4: 30
    }

    return clockhours[clocktype] || 6
}

exports.mcmined = (toolstype, clocktype) => {
    let amount = 0;
    const mcamount = exports.clockhoursadd(clocktype)

    switch (toolstype){
        case "2":
            amount =  mcamount * 1.5
            break;
        case "3":
            amount = mcamount * 2
            break;
        case "4":
            amount = mcamount * 2.5
            break;
        case "5":
            amount = mcamount * 3
            break;
        default:
            amount = mcamount
            break;
    }

    return amount
}

exports.checkgameavailable = (substype, gametype) => {
    const allowedGameTypes = {
        Pearl: ["woodcutting"],
        Pearlplus: ["woodcutting"],
        Ruby: ["woodcutting", "mining", "fishing"],
        Emerald: ["woodcutting", "mining", "fishing", "farming", "hunting"],
        Diamond: ["woodcutting", "mining", "fishing", "farming", "hunting", "crafting", "smithing"]
      };

      const allowedTypes = allowedGameTypes[substype];

      if (!allowedTypes || !allowedTypes.includes(gametype)) {
        return "restricted";
      }
    
      // If the subtype is allowed for the given gametype
      return "allowed";
}

exports.addtototalfarmmg = async (mgfarm) => {
    const comactmg = await Communityactivity.findOne({type: "monstergem"})
    .then(data => data.amount)
    .catch(() => "bad-request")

    const mongem = await Monmoncoin.findOne({name: "Monster Gem"})
    .then(data => data.amount)
    .catch(() => "bad-request")

    const gameactmg = await Gameactivity.findOne()
    .then(data => data.initial)
    .catch(() => "bad-request")

    let maxmgamount = comactmg
    maxmgamount += gameactmg

    const remainingmgSpace = maxmgamount - mongem;
    let mgtobeadded = 0

    if (mgfarm <= remainingmgSpace){
        mgtobeadded = mgfarm
    }
    else{
        mgtobeadded = remainingmgSpace
    }

    return await Monmoncoin.findOneAndUpdate({name: "Monster Gem"}, [{
        $set: {
            amount: {
                $min: [maxmgamount, {
                    $add: ["$amount", mgfarm]
                }]
            }
        }
    }])
    .then(() => {
        return {message: "success", mgtobeadded: mgtobeadded.toFixed(5)}
    })
    .catch(() => {
        return {message: "bad-request"}
    })
}

exports.minustototalcoins = async (name, amount) => {
    return await Monmoncoin.findOneAndUpdate({name: name}, [{
        $set: {
            amount: {
                $max: [0, {
                    $add: ["$amount", -amount]
                }]
            }
        }
    }])
    .then(() => "success")
    .catch(() => "bad-request")
}

exports.getfarm = (timestarted, unixtime, maxtotal) => {
    // Start time and expiration time in Unix timestamps
    const startTime = timestarted;
    const expirationTime = unixtime;

    // Get the current time in Unix timestamp format
    const currentTime = Math.floor(new Date().getTime() / 1000);

    // Maximum total coins to be farmed
    const maxTotalCoins = maxtotal;

    // Calculate total farming duration in seconds
    const totalFarmingDuration = expirationTime - startTime;

    // Calculate coins per hour
    const coinsPerHour = (maxTotalCoins / (totalFarmingDuration / 3600));

    // Calculate current time between start time and expiration time in seconds
    const currentTimeBetween = Math.min(currentTime - startTime, totalFarmingDuration); // Consider current time up to expiration

    // Calculate total coins farmed
    const totalCoinsFarmed = Math.min((currentTimeBetween / 3600 * coinsPerHour), maxTotalCoins);

    return totalCoinsFarmed
}

exports.prizepooladd = async (amount, type) => {
    return await Prizepools.findOne({type: type})
    .then(async data => {
        if (!data){
            return "notexist"
        }

        return await Prizepools.findOneAndUpdate({type: type}, {$inc: {amount: amount}})
        .then(() => "success")
        .catch(() => "bad-request")
    })
    .catch(() => "bad-request")
}

exports.fiestarewards = async () => {
    const randomNumber = Math.floor(Math.random() * 100) + 1;

    const chances = [
        // { name: "1", type: "energy", chance: 80 },
        // { name: "2", type: "energy", chance: 9 },
        // { name: "3", type: "energy", chance: 5 },
        { name: "5", type: "monster coin", chance: 80 },
        { name: "10", type: "monster coin", chance: 10 },
        { name: "15", type: "monster coin", chance: 9 },
        { name: "20", type: "monster coin", chance: 1 },
    ];

    let cumulativeChance = 0;

    for (const { name, type, chance } of chances) {
        cumulativeChance += chance;
        if (randomNumber <= cumulativeChance) {
            return { message: "success", name: name, type: type}
        }
    }

    return null;
}

exports.getenergy = async(id) => {
    return await Energy.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => {
        console.log(err)
        return "bad-request"
    })
}