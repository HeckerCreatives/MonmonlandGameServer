const router = require("express").Router()
const { playgame, getgames, claimgame } = require("../controllers/Gameplay")
const { protectplayer } = require("../middleware/middleware")

router
    .post("/playgame", protectplayer, playgame)
    .get("/getgames", protectplayer, getgames)
    .post("/claimgame", protectplayer, claimgame)

module.exports = router;
