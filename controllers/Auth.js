const Gameusers = require("../models/Gameusers")

const jsonwebtokenPromisified = require('jsonwebtoken-promisified');
const path = require("path");

const privateKey = fs.readFileSync(path.resolve(__dirname, "../keygen/private-key.pem"), 'utf-8');

const encrypt = async password => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

exports.authlogin = async (req, res) => {

    const { username, password } = req.query

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
                    const payload = { id: user._id, token: token }

                    try {
                        jwtoken = await jsonwebtokenPromisified.sign(payload, privateKey, { algorithm: 'RS256' });
                    } catch (error) {
                        console.error('Error signing token:', error.message);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }

                    res.cookie('sessionToken', jwtoken, { httpOnly: true })
                    res.json({message: "success"})
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