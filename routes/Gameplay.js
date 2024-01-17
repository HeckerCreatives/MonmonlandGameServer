const router = require("express").Router()
const { playgame, getgames, claimgame, playpalosebo, playsupermonmon, playsponsor } = require("../controllers/Gameplay")
const { protectplayer } = require("../middleware/middleware")

router
    .post("/playgame", protectplayer, playgame)
    .get("/getgames", protectplayer, getgames)
    .get("/playpalosebo", protectplayer, playpalosebo)
    .get("/playsupermonmon", protectplayer, playsupermonmon)
    .get("/playsponsor", protectplayer, playsponsor)
    .post("/claimgame", protectplayer, claimgame)

module.exports = router;
