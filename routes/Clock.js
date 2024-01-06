const router = require("express").Router()
const { getclock, equipclock, buyclocks } = require("../controllers/Clock")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getclock", protectplayer, getclock)
    .post("/equipclock", protectplayer, equipclock)
    .post("/buyclocks", protectplayer, buyclocks)

module.exports = router;
