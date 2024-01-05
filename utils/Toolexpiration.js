const Equipment = require("../models/Equipment")
const { default: mongoose } = require("mongoose")
const { DateTimeServer } = require("../utils/Datetimetools")

exports.checktoolexpiration = async (id, itemid) => {
    let response = {}
    await Equipment.findOne({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)})
    .then(async data => {
        if (!data){
            response = {message: "notexist"}
            return 
        }

        if (data.type != "1" && data.expiration <= DateTimeServer()){
            await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), _id: new mongoose.Types.ObjectId(itemid)}, {expiration: 0, isowned: 0, isequip: 0})
            .then(async tooldata => {
                await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: "1"}, {isequip: 1})
                .then(equipdata => {
                    response = {message: "expired", data: equipdata}
                    return 
                })
                .catch(err => {
                    response = {message: "bad-request"}
                    return 
                })
            })
            .catch(err => {
                response = {message: "bad-request"}
                return 
            })
        }
        else{
            response = {message: "notexpired", data: data}
            return 
        }
    })
    .catch(err => {
        response = {message: "bad-request"}
        return 
    })
    
    return response
}

exports.checkalltoolsexpiration = async (id) => {
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
            },
            {
                type: { $ne: "1" }
            }
        ]
    }

    const update = {
        $set: {
            expiration: "0",
            isowned: "0",
            isequip: "0"
        }
    }
    let response = {}

    await Equipment.updateMany(filter, update)
    .then(async () => {
        
        let equipped = false;

        const equipments = await Equipment.find({owner: new mongoose.Types.ObjectId(id)})
        .then(data => data)
        .catch(err => {
            response = {message: "bad-request", data: err.message}
            return
        })


        equipments.map(e => {
            if (e.type != "1"){
                if (e.isequip == "1"){
                    equipped = true
                }
            }
        })

        if (!equipped){
            await Equipment.findOneAndUpdate({owner: new mongoose.Types.ObjectId(id), type: "1"}, {isequip: "1"})
            .then(() => {
                response = {message: "success"}
                return
            })
            .catch(err => {
                response = {message: "bad-request", data: err.message}
                return
            })
        }

        response = {message: "success"}
        return
    })
    .catch(err => {
        response = {message: "bad-request", data: err.message}
        return
    })

    return response
}

exports.gettoolsamount = (toolstype) => {
    let toolsamount = 0;

    switch(toolstype){
        case "2":
            toolsamount = 10
            break;
        case "3":
            toolsamount = 20
            break;
        case "4":
            toolsamount = 30
            break;
        case "5":
            toolsamount = 40
            break;
        default:
            toolsamount = 0;
            break;
    }

    return toolsamount;
}