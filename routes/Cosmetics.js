const router = require("express").Router()
const { getcosmetics, equipcosmetics, buycosmetics } = require("../controllers/Cosmetics")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getcosmetics", protectplayer, getcosmetics)
    .post("/equipcosmetics", protectplayer, equipcosmetics)
    .post("/buycosmetics", protectplayer, buycosmetics)


module.exports = router;
