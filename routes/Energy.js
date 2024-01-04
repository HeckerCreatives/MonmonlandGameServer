const router = require("express").Router()
const { getenergy } = require("../controllers/Energy")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getenergy", protectplayer, getenergy)

module.exports = router;
