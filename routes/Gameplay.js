const router = require("express").Router()
const { playgame, getgames, claimgame, playpalosebo, playsupermonmon, playsponsor, startsupermonmon, endsupermonmon, supermonmonleaderboard } = require("../controllers/Gameplay")
const { protectplayer } = require("../middleware/middleware")

router
    .post("/playgame", protectplayer, playgame)
    .get("/getgames", protectplayer, getgames)
    .get("/playpalosebo", protectplayer, playpalosebo)
    .get("/playsupermonmon", protectplayer, playsupermonmon)
    .get("/playsponsor", protectplayer, playsponsor)
    .post("/claimgame", protectplayer, claimgame)
    .get("/startsupermonmon", protectplayer, startsupermonmon)
    .post("/endsupermonmon", protectplayer, endsupermonmon)
    .get("/supermonmonleaderboard", protectplayer, supermonmonleaderboard)

module.exports = router;
