const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        type: {
            type: String
        },
        value: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

const Task = mongoose.model("Task", taskSchema);
module.exports = Task