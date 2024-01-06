const { default: mongoose } = require("mongoose")
const Clock = require("../models/Clock")
const { DateTimeServer } = require("../utils/Datetimetools")

exports.checkclockexpiration = async(id, itemid) => {
    const response = await Clock.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
    .then(data => {
        if (!data){
            return {message: "notexist"}
        }

        if (data.expiration <= DateTimeServer()){
            Clock.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)}, {expiration: 0, isowned: 0, isequip: 0})
            .then(clockdata => {
                return {message: "expired", data: clockdata}
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

exports.checkallclockexpiration = async(id) => {
    const time = DateTimeServer()
    const filter = {
        $and : [
            {
                owner: new mongoose.Types.ObjectId(id)
            },
            {
                expiration: { 
                    $lte: time
                },
                isowned: "1"
            }
        ]
    }

    const update = {
        $set: {
            expiration: 0,
            isowned: "0",
            isequip: "0"
        }
    }

    const response = await Clock.updateMany(filter, update)
    .then(() => "success")
    .catch(err => "bad-request")

    return response
}

exports.getclocksamount = (clockstype) => {
    let clocksamount = 0;

    switch(clockstype){
        case "1":
            clocksamount = 10
            break;
        case "2":
            clocksamount = 35
            break;
        case "3":
            clocksamount = 50
            break;
        case "4":
            clocksamount = 60
            break;
        default:
            clocksamount = 0;
            break;
    }

    return clocksamount;
}