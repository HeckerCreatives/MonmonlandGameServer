const router = require("express").Router()
const { gettools, equiptools } = require("../controllers/Tools")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/gettools", protectplayer, gettools)
    .post("/equiptools", protectplayer, equiptools)

module.exports = router;
