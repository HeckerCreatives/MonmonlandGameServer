const { default: mongoose } = require("mongoose");
const Pooldetails = require("../models/Pooldetails")

exports.getsubsamount = (substype) => {
    let subsamount = 0;

    switch(substype){
        case "Ruby":
            subsamount = 20
            break;
        case "Emerald":
            subsamount = 50
            break;
        case "Diamond":
            subsamount = 100
            break;
        default:
            subsamount = 0;
            break;
    }

    return subsamount;
}

exports.getpooldetails = async (id) => {
    return await Pooldetails.findOne({owner: new mongoose.Types.ObjectId(id)})
    .then(data => {
        if (!data){
            return "erroraccount"
        }

        return data
    })
    .catch(err => {
        console.log(err.message)
        return "bad-request"
    })
}