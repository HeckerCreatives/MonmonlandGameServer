const Communityactivity = require("../modelweb/Communityactivity")
const Ads = require("../modelweb/Ads")
const Investorfunds = require("../modelweb/Investorfunds")
const Monmoncoin = require("../modelweb/Monmoncoin")
const Gameactivity = require("../modelweb/Gameactivity")

exports.checkmgtools = (tooltype, cosmetics) => {
    let mgamount = 0;
    
    if (cosmetics == "Diamondring"){
        switch(tooltype) {
            case "2":
                mgamount = 0.35;
                break;
            case "3":
                mgamount = 0.60;
                break;
            case "4":
                mgamount = 0.75;
                break;
            case "5":
                mgamount = 1;
                break;
            default:
                mgamount = 0;
                break;
        }
    }
    else{
        switch(tooltype) {
            case "2":
                mgamount = Math.random() * (0.35 - 0.20) + 0.20;
                break;
            case "3":
                mgamount = Math.random() * (0.40 - 0.60) + 0.40;
                break;
            case "4":
                mgamount = Math.random() * (0.55 - 0.75) + 0.55;
                break;
            case "5":
                mgamount = Math.random() * (0.80 - 1) + 0.80;
                break;
            default:
                mgamount = 0;
                break;
        }
    }

    return mgamount;
}

exports.checkmgclock = (clocktype, substype) => {
    const pricingInfo = {
        Pearl: 0,
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
    
      return (pricingInfo[substype] && pricingInfo[substype][clocktype]) || pricingInfo[substype].default || 0;
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

exports.addtototalfarmmc = async (mcfarm, mgfarm) => {
    const ads = await Ads.findOne()
    .then(data => data.amount)
    .catch(() => "bad-request")

    const investor = await Investorfunds.findOne()
    .then(data => data.amount)
    .catch(() => "bad-request")

    const gameact = await Gameactivity.findOne()
    .then(data => data.total)
    .catch(() => "bad-request")

    const comact = await Communityactivity.find({$or: [
        {
            type: "grinding"
        },
        {
            type: "quest"
        },
        {
            type: "monstergem"
        }
    ]})
    .then(data => data)
    .catch(() => "bad-request")

    const monmoncoins = await Monmoncoin.findOne({name: "Monster Coin"})
    .then(data => data.amount)
    .catch(() => "bad-request")

    const mongem = await Monmoncoin.findOne({name: "Monster Gem"})
    .then(data => data.amount)
    .catch(() => "bad-request")

    let maxamount = 0
    let maxmgamount = 0

    comact.forEach(comactdata => {
        const { amount } = comactdata

        if (comactdata.type == "grinding" || comactdata.type == "quest"){
            maxamount += amount
        }
        else if (comactdata.type == "monstergem"){
            maxmgamount += amount
        }
    })

    maxamount += ads + investor + gameact

    const remainingSpace = maxamount - monmoncoins;
    const remainingmgSpace = maxmgamount - mongem;
    let mctobeadded = 0
    let mgtobeadded = 0

    if (mcfarm <= remainingSpace) {
        mctobeadded = mcfarm; // Return the added value
    }
    else {
        mctobeadded = remainingSpace; // Return the remaining space
    }

    if (mgfarm <= remainingmgSpace){
        mgtobeadded = mgfarm
    }
    else{
        mgtobeadded = remainingmgSpace
    }

    await Monmoncoin.findOneAndUpdate({name: "Monster Gem"}, [{
        $set: {
            amount: {
                $min: [maxmgamount, {
                    $add: ["$amount", mgfarm]
                }]
            }
        }
    }])

    return await Monmoncoin.findOneAndUpdate({name: "Monster Coin"}, [{
        $set: {
            amount: {
                $min: [maxamount, {
                    $add: ["$amount", mcfarm]
                }]
            }
        }
    }])
    .then(() => {
        return {message: "success", mctobeadded: mctobeadded.toFixed(2), mgtobeadded: mgtobeadded.toFixed(2)}
    })
    .catch(() => {
        return {message: "bad-request", }
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
    const coinsPerHour = (maxTotalCoins / (totalFarmingDuration / 3600)).toFixed(2);

    // Calculate current time between start time and expiration time in seconds
    const currentTimeBetween = Math.min(currentTime - startTime, totalFarmingDuration); // Consider current time up to expiration

    // Calculate total coins farmed
    const totalCoinsFarmed = Math.min((currentTimeBetween / 3600 * coinsPerHour), maxTotalCoins);

    return totalCoinsFarmed
}