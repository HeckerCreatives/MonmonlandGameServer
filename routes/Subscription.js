const router = require("express").Router()
const { buysubscription } = require("../controllers/Subscription")
const { protectplayer } = require("../middleware/middleware")

router
    .post("/buysubscription", protectplayer, buysubscription)


module.exports = router;
