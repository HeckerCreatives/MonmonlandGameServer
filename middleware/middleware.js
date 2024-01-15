const Gameusers = require("../models/Gameusers")
const fs = require('fs');
const path = require("path");
const publicKey = fs.readFileSync(path.resolve(__dirname, "../keygen/public-key.pem"), 'utf-8');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const Maintenance = require("../models/Maintenance")


const verifyJWT = async (token) => {
    try {
        const decoded = await jsonwebtokenPromisified.verify(token, publicKey, { algorithms: ['RS256'] });
        return decoded;
    } catch (error) {
        console.error('Invalid token:', error.message);
        throw new Error('Invalid token');
    }
};

exports.protectplayer = async (req, res, next) => {
    const token = req.headers.authorization

    if (!token){
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try{
        if (!token.startsWith("Bearer")){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const headerpart = token.split(' ')[1]

        const decodedToken = await verifyJWT(headerpart);

        const maintenance = await Maintenance.findOne({type: "maintenancefullgame"})
        .then(data => {
            if (!data){
                return "nomaintenance"
            }
    
            return data.value
        })
        .catch(() => "bad-request")

        console.log(maintenance)
        
        if (maintenance == "1") {
            return res.status(401).json({ message: 'maintenance' })
        }

        if (maintenance == "bad-request"){
            return res.status(401).json({ message: 'nad-request' });
        }

        const userdata = await Gameusers.findOne({_id: decodedToken.id})
        .select("-password")
        .then(data => data)
        .catch(err => res.status(401).json({ message: 'Unauthorized' }))

        if (decodedToken.token != userdata.token){
            return res.status(401).json({ message: 'duallogin' })
        }

        if (decodedToken.status != "active"){
            return res.status(401).json({ message: 'banned' })
        }

        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}