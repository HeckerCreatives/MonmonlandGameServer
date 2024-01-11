const router = require("express").Router()
const { getgameannouncement } = require("../controllers/Gameannouncement")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getgameannouncement", protectplayer, getgameannouncement)

module.exports = router;
