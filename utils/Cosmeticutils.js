const { default: mongoose } = require("mongoose")
const Cosmetics = require("../models/Cosmetics")
const { DateTimeServer } = require("./Datetimetools")

exports.checkallcosmeticsexpiration = async (id) => {
    const time = DateTimeServer()
    const filter = {
        $and: [
            {
                owner: new mongoose.Types.ObjectId(id)
            },
            {
                permanent: "nonpermanent",
                expiration: {
                    $lte: time
                }
            }
        ]
    }

    const response = await Cosmetics.deleteMany(filter)
    .then(() => "success")
    .catch(err => "bad-request")

    return response
}

exports.checkcosmeticexpiration = async(id, itemid) => {
    const response = await Cosmetics.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
    .then(data => {
        if (!data){
            return {message: "notexist"}
        }

        if (data.permanent == "nonpermanent" && data.expiration <= DateTimeServer()){
            Cosmetics.findByIdAndDelete(itemid)
            .then(() => {
                return {message: "expired"}
            })
            .catch(err => {
                return {message: "bad-request"}
            })
        }
        else{
            return {message: "notexpired", data: data}
        }
    })
    .catch(err => {
        return {message: "bad-request"}
    })
    
    return response
}

exports.checkenergyringequip = async (id) => {
    const checker = await Cosmetics.findOne({owner: new mongoose.Types.ObjectId(id), name: "Energy", type: "ring", isequip: "1"})
    .then(data => {
        if (!data){
            return "noequip"
        }

        return "equip"
    })
    .catch(() => "bad-request")

    return checker
}


exports.checkequipring = async (id) => {
    const maximumenergy = await Cosmetics.findOne({owner: new mongoose.Types.ObjectId(id), type: "ring", isequip: "1"})
    .then(data => {
        if (!data){
            return 0
        }

        switch(data.name){
            case "Pearl": 
                return 5
            case "Ruby":
                return 10
            case "Emerald":
                return 20
            case "Diamond":
                return 30
            default:
                return 0
        }
    })
    .catch(() => "bad-request")

    return maximumenergy
}

exports.getcosmeticsamount = (cosmeticstype) => {
    let cosmeticsamount = 0;

    switch(cosmeticstype){
        case "Rubyring":
            cosmeticsamount = 5
            break;
        case "Emeraldring":
            cosmeticsamount = 10
            break;
        case "Diamondring":
            cosmeticsamount = 20
            break;
        case "Energyring":
            cosmeticsamount = 30
            break;
        default:
            cosmeticsamount = 0;
            break;
    }

    return cosmeticsamount;
}