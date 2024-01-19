const { default: mongoose } = require("mongoose")
const Walletscutoff = require("../models/Walletscutoff")
const Task = require("../models/Task")
const Gameunlock = require("../models/Gameunlock")
const { getpooldetails } = require("../utils/Pooldetailsutils")
const { addwalletamount } = require("../utils/Walletutils")
const { addtototalfarmmc } = require("../utils/Gameutils")

exports.gettaskdata = async(req, res) => {
    const { id } = req.user

    const walletsdata = await Walletscutoff.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!walletsdata){
        return res.json({message: "nodatawallets"})
    }

    const pooldetails = await getpooldetails(id)

    if (pooldetails == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldetails == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }
    else if (!pooldetails){
        return res.json({message: "nodatapooldetails"})
    }

    const taskdata = await Task.find({owner: new mongoose.Types.ObjectId(id)})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (taskdata.length <= 0){
        return res.json({message: "nodatatask"})
    }

    const finaltaskdata = {}

    taskdata.forEach(data => {
        finaltaskdata[data.type] = data.value
    })

    const finaldata = {
        subscription: pooldetails.subscription,
        taskdata: finaltaskdata
    }

    walletsdata.forEach(data => {
        if (
            data.wallettype === "fiestaparticipation" ||
            data.wallettype === "sponsorparticipation" ||
            data.wallettype === "directpoints" ||
            data.wallettype === "adspoints"
          ) {
            finaldata[data.wallettype] = data.amount;
          }
    })

    return res.json({message: "success", data: finaldata})
}

exports.claimtask = async(req, res) => {
    const { id } = req.user
    const { tasktype } = req.body

    const task = await Task.findOne({owner: new mongoose.Types.ObjectId(id), type: tasktype})
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    if (!task){
        return res.json({message: "notaskdata"})
    }

    if (task.value == "1"){
        return res.json({message: "already claimed"})
    }

    const pooldetails = await getpooldetails(id)

    if (pooldetails == "erroraccount"){
        return res.json({message: "erroraccount"})
    }
    else if (pooldetails == "bad-request"){
        return res.status(400).json({ message: "bad-request" })
    }
    else if (!pooldetails){
        return res.json({message: "nodatapooldetails"})
    }

    const walletdata = await Walletscutoff.find()
    .then(data => data)
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))

    
    if (walletdata.length <= 0){
        return res.json({message: "nowalletdata"})
    }

    const ads = walletdata.filter(e => e.wallettype == "adspoints")
    const directinvite = walletdata.filter(e => e.wallettype == "directpoints")
    const fiestaparticipation = walletdata.filter(e => e.wallettype == "fiestaparticipation")
    const sponsorparticipation = walletdata.filter(e => e.wallettype == "sponsorparticipation")

    if (tasktype == "1"){
        if (ads < 50){
            return res.json({message: "requirementsnotmet"})
        }

        if (fiestaparticipation < 50){
            return res.json({message: "requirementsnotmet"})
        }

        await Gameunlock.create({owner: new mongoose.Types.ObjectId(id), type: "claimall", value: "1"})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }));
        
        if (pooldetails.subscription != "Pearl"){
            const addtofarm = await addtototalfarmmc(200, 0)

            if (addtofarm.message != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            const addmc = await addwalletamount(id, "monstercoin", addtofarm.mctobeadded)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
        else{
            const addmc = await addwalletamount(id, "monstercoin", 200)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
    }
    else if (tasktype == "2"){
        if (ads < 100){
            return res.json({message: "requirementsnotmet"})
        }

        if (fiestaparticipation < 100){
            return res.json({message: "requirementsnotmet"})
        }

        if (sponsorparticipation < 1){
            return res.json({message: "requirementsnotmet"})
        }

        await Gameunlock.create({owner: new mongoose.Types.ObjectId(id), type: "playall", value: "1"})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }));
        
        if (pooldetails.subscription != "Pearl"){
            const addtofarm = await addtototalfarmmc(300, 0)

            if (addtofarm.message != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            const addmc = await addwalletamount(id, "monstercoin", addtofarm.mctobeadded)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
        else{
            const addmc = await addwalletamount(id, "monstercoin", 300)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
    }
    else if (tasktype == "3"){
        if (pooldetails.subscription != "Ruby" && pooldetails.subscription != "Emerald" && pooldetails.subscription != "Diamond"){
            return res.json({message: "requirementsnotmet"})
        }

        if (fiestaparticipation < 20){
            return res.json({message: "requirementsnotmet"})
        }

        if (ads < 20){
            return res.json({message: "requirementsnotmet"})
        }

        await Gameunlock.create({owner: new mongoose.Types.ObjectId(id), type: "sponsorgame", value: "1"})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }));
        
        if (pooldetails.subscription != "Pearl"){
            const addtofarm = await addtototalfarmmc(50, 0)

            if (addtofarm.message != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            const addmc = await addwalletamount(id, "monstercoin", addtofarm.mctobeadded)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
        else{
            const addmc = await addwalletamount(id, "monstercoin", 50)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
    }
    else if (tasktype == "4"){
        if (ads < 10){
            return res.json({message: "requirementsnotmet"})
        }

        await Gameunlock.create({owner: new mongoose.Types.ObjectId(id), type: "fiestagame", value: "1"})
        .catch(err => res.status(400).json({ message: "bad-request", data: err.message }));

        if (pooldetails.subscription != "Pearl"){
            const addtofarm = await addtototalfarmmc(50, 0)

            if (addtofarm.message != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            const addmc = await addwalletamount(id, "monstercoin", addtofarm.mctobeadded)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
        else{
            const addmc = await addwalletamount(id, "monstercoin", 50)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
    }
    else if (tasktype == "5"){
        if (directinvite < 50){
            return res.json({message: "requirementsnotmet"})
        }

        if (pooldetails.subscription != "Pearl"){
            const addtofarm = await addtototalfarmmc(1000, 0)

            if (addtofarm.message != "success"){
                return res.status(400).json({ message: "bad-request" })
            }

            const addmc = await addwalletamount(id, "monstercoin", addtofarm.mctobeadded)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
        else{
            const addmc = await addwalletamount(id, "monstercoin", 1000)
            
            if (addmc != "success"){
                return res.status(400).json({ message: "bad-request" })
            }
        }
    }
    else{
        return res.json({message: "tasknotexist"})
    }

    await Task.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: tasktype}, {value: "1"})
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }));

    return res.json({message: "success"})
}