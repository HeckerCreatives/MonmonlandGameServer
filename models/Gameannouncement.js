const mongoose = require("mongoose");

const Gameannouncementschema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Gameannouncement = mongoose.model("Gameannouncement", Gameannouncementschema);
module.exports = Gameannouncement