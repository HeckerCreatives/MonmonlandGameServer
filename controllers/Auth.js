const Gameusers = require("../models/Gameusers")
const fs = require('fs');

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");
const { DateTimeServer } = require("../utils/Datetimetools")

const privateKey = fs.readFileSync(path.resolve(__dirname, "../keygen/private-key.pem"), 'utf-8');

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.authlogin = async (req, res) => {

    const { username, password, version } = req.query

    if (process.env.maintenancefullgame == "1"){
        return res.json({message: "maintenance"})
    }

    if (version != process.env.gameversion){
        return res.json({message: "newupdate"})
    }

    Gameusers.findOne({ username: username })
    .then(async user => {
        if (user && (await user.matchPassword(password))){
            if (user.status != "active"){
                return res.json({ message: "banned" })
            }
            else{
                const token = await encrypt(privateKey)

                Gameusers.findByIdAndUpdate({_id: user._id}, {$set: { token: token}}, { new: true })
                .select("-password")
                .then(async () => {
                    const payload = { id: user._id, username: user.username, status: user.status, token: token }
                    let jwtoken = ""
                    
                    try {
                        jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                    } catch (error) {
                        console.error('Error signing token:', error.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    const data = {
                        token: jwtoken,
                        datetime: DateTimeServer()
                    }

                    res.json({message: "success", data: data})
                })
                .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
            }
        }
        else{
            res.json({ message: "nouser"})
        }
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: err.message }))
}