const Gameusers = require("../models/Gameusers")
const fs = require('fs');
const path = require("path");
const publicKey = fs.readFileSync(path.resolve(__dirname, "../keygen/public-key.pem"), 'utf-8');
const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const { checkmaintenance } = require("../utils/Maintenance")
const { getpooldetails } = require("../utils/Pooldetailsutils")
const { DateTimeExpiration, DateTimeServer } = require("../utils/Datetimetools")


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

        const maintenance = await checkmaintenance("maintenancefullgame")
        
        if (maintenance == "1") {
            return res.status(401).json({ message: 'maintenance' })
        }

        if (maintenance == "bad-request"){
            return res.status(401).json({ message: 'bad-request' })
        }

        const userdata = await Gameusers.findOne({_id: decodedToken.id})
        .select("-password")
        .then(data => data)
        .catch(err => res.status(401).json({ message: 'Unauthorized' }))

        //  CHECK IF DATE REGISTRATION > DATE REGISTRATION + 3 DAYS
        //  IF TRUE RETURN MESSAGE INACTIVE
        //  ONLY FOR PEARL
        const pooldeets = await getpooldetails(decodedToken.id)

        if (pooldeets == "erroraccount"){
            return res.status(401).json({ message: 'erroraccount' })
        }

        if (pooldeets == "bad-request"){
            return res.status(401).json({ message: 'Unauthorized' });
        }

        if (pooldeets.subscription == "Pearl"){
            const expirationunixtime = DateTimeExpiration(userdata.createdAt, 3)
            if (DateTimeServer() > expirationunixtime){

                if (userdata.status == "active"){
                    await Gameusers.findOneAndUpdate({_id: decodedToken.id}, {status: "expired"})
                    .catch(err => res.status(401).json({ message: 'Unauthorized' }))
                }

                return res.status(401).json({message: "pearlinactive"})
            }
        }

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