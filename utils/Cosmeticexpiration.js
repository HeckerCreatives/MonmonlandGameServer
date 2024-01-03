const { default: mongoose } = require("mongoose")
const Cosmetics = require("../models/Cosmetics")
const { DateTimeServer } = require("../utils/Datetimetools")

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