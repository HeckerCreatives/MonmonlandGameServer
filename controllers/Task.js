const { default: mongoose } = require("mongoose")
const Walletscutoff = require("../models/Walletscutoff")
const Task = require("../models/Task")
const { getpooldetails } = require("../utils/Pooldetailsutils")

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

    
}