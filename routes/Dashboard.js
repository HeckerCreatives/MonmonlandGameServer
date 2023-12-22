const router = require("express").Router()
const { dashboardplayer, findpooldetails, findwallet, findwalletcutoff } = require("../controllers/Dashboard")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/dashboardplayer", protectplayer, dashboardplayer)
    .get("/findpooldetails", protectplayer, findpooldetails)
    .get("/findwallet", protectplayer ,findwallet)
    .get("/findwalletcutoff", protectplayer, findwalletcutoff)

module.exports = router;
