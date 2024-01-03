const router = require("express").Router()
const { getcosmetics, equipcosmetics } = require("../controllers/Cosmetics")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getcosmetics", protectplayer, getcosmetics)
    .post("/equipcosmetics", protectplayer, equipcosmetics)


module.exports = router;
