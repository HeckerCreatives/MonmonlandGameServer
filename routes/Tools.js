const router = require("express").Router()
const { gettools, equiptools, buytools } = require("../controllers/Tools")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/gettools", protectplayer, gettools)
    .post("/equiptools", protectplayer, equiptools)
    .post("/buytools", protectplayer, buytools)

module.exports = router;
