const mongoose = require("mongoose");

const MailSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        subject: {
            type: String
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true
    }
)

const Mail = mongoose.model("Mail", MailSchema);
module.exports = Mail