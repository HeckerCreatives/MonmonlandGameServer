const router = require("express").Router()
const { dashboardplayer, findpooldetails, findwallet, findwalletcutoff, uploadprofilepicture } = require("../controllers/Dashboard")
const { protectplayer } = require("../middleware/middleware")
const pictureupload = require("../middleware/uploadpicture")

const uploadimg = pictureupload.single("file")

router
    .get("/dashboardplayer", protectplayer, dashboardplayer)
    .get("/findpooldetails", protectplayer, findpooldetails)
    .get("/findwallet", protectplayer ,findwallet)
    .get("/findwalletcutoff", protectplayer, findwalletcutoff)
    .post("/uploadprofilepicture", protectplayer, function (req, res, next){
        uploadimg(req, res, function(err) {
            if (err){
                return res.status(400).send({ message: "failed", data: err.message })
            }

            next()
        })
    }, uploadprofilepicture)

module.exports = router;
