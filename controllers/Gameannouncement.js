const Gameannouncement = require("../models/Gameannouncement")

exports.getgameannouncement = (req, res) => {
    Gameannouncement.find()
    .sort({createdAt: -1})
    .then(data => {
        if (data.length <= 0){
            return res.json({message: "noannouncement"})
        }

        const finaldata = {
            title: data[0].title,
            description: data[0].description
        }
        
        return res.json({message: "success", data: finaldata})
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}