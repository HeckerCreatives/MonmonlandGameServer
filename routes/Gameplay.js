const router = require("express").Router()
const { playgame, getgames, claimgame, playpalosebo, playsupermonmon, playsponsor, startsupermonmon, endsupermonmon, supermonmonleaderboard, startpalosebo, endpalosebo, paloseboleaderboard } = require("../controllers/Gameplay")
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
    .get("/startpalosebo", protectplayer, startpalosebo)
    .post("/endpalosebo", protectplayer, endpalosebo)
    .get("/paloseboleaderboard", protectplayer, paloseboleaderboard)

module.exports = router;
