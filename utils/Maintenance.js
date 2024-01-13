const Maintenance = require("../models/Maintenance")

exports.checkmaintenance = async (maintenancetype) => {
    return await Maintenance.findOne({type: maintenancetype})
    .then(data => {
        if (!data){
            return "nomaintenance"
        }

        return data.value
    })
    .catch(() => "bad-request")
}