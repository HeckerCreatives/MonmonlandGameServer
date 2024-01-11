const router = require("express").Router()
const { claimads } = require("../controllers/Ads")
const { protectplayer } = require("../middleware/middleware")

router
    .post("/claimads", protectplayer, claimads)


module.exports = router;
