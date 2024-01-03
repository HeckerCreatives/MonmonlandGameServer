const router = require("express").Router()
const { getcosmetics } = require("../controllers/Cosmetics")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getcosmetics", protectplayer, getcosmetics)


module.exports = router;
