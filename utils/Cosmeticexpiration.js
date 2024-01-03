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