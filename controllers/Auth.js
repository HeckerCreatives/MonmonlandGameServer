const Gameusers = require("../models/Gameusers")
const fs = require('fs');

const bcrypt = require('bcrypt');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");
const { DateTimeServer, DateTimeExpiration } = require("../utils/Datetimetools")
const { checkmaintenance } = require("../utils/Maintenance")
const { getpooldetails } = require("../utils/Pooldetailsutils")

const privateKey = fs.readFileSync(path.resolve(__dirname, "../keygen/private-key.pem"), 'utf-8');

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.authlogin = async (req, res) => {

    const { username, password, version } = req.query

    const maintenance = await checkmaintenance("maintenancefullgame")

    if (maintenance == "1") {
        return res.json({message: "maintenance", data: "The game is in maintenance! Please try again later."})
    }

    if (version != process.env.gameversion){
        return res.json({message: "newupdate", data: "There's a new update! Please download on google play or website."})
    }

    Gameusers.findOne({ username: { $regex: new RegExp('^' + username + '$', 'i') } })
    .then(async user => {
        if (user && (await user.matchPassword(password))){
            if (user.status == "inactive"){
                return res.json({ message: "banned", data: "Your account had been banned! Please contact support for more details" })
            }
            else if (user.status == "expired"){
                return res.json({ message: "expired", data: "Your account has been expired! Please subscribe to monmonland to continue earning." })
            }
            else{

                const pooldeets = await getpooldetails(user._id)

                if (pooldeets == "erroraccount"){
                    return res.status(401).json({ message: 'erroraccount',  data: "There's a problem with your account! Please contact customer support for more details. Error 001"})
                }
        
                if (pooldeets == "bad-request"){
                    return res.status(401).json({ message: 'bad-request', data: "There's a problem with your account! Please contact customer support for more details. Error 002" });
                }
        
                if (pooldeets.subscription == "Pearl"){

                    const expirationunixtime = DateTimeExpiration(user.createdAt, 3)

                    if (DateTimeServer() > expirationunixtime){

                        if (user.status == "active"){

                            await Gameusers.findOneAndUpdate({_id: user._id}, {status: "expired"})
                            .catch(err => res.status(401).json({ message: 'bad-request', data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details. Error 003" }))
                        }
        
                        return res.status(401).json({message: "pearlinactive"})
                    }
                }
        

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
                        return res.status(500).json({ error: 'Internal Server Error', data: "There's a problem signing in! Please contact customer support for more details! Error 004" });
                    }

                    const data = {
                        token: jwtoken,
                        datetime: DateTimeServer()
                    }

                    res.json({message: "success", data: data})
                })
                .catch(err => res.status(400).json({ message: "bad-request", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details. Error 003" }))
            }
        }
        else{
            res.json({message: "nouser", data: "Username/Password does not match! Please try again using the correct credentials!"})
        }
    })
    .catch(err => res.status(400).json({ message: "bad-request", data: "There's a problem with your account! There's a problem with your account! Please contact customer support for more details. Error 005" }))
}