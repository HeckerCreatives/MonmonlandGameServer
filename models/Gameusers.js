const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

const GameusersSchema = new mongoose.Schema(
    {
        username: {
            type: String
        },
        password: {
            type: String
        },
        referral: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gameusers"
        },
        status: {
            type: String,
            default: "active"
        },
        token: {
            type: String,
        },
        webtoken: {
            type: String
        },
        bandate: {
            type: String
        },
        banreason: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

GameusersSchema.pre("save", async function (next) {
    if (!this.isModified) {
      next();
    }
  
    this.password = await bcrypt.hashSync(this.password, 10)
});

GameusersSchema.methods.matchPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

const Gameusers = mongoose.model("Gameusers", GameusersSchema);
module.exports = Gameusers