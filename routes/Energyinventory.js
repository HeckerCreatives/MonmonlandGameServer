const router = require("express").Router()
const { getenergyinventory, useenergyinventory, buyenergyinventory } = require("../controllers/Energyinventory")
const { protectplayer } = require("../middleware/middleware")

router
    .get("/getenergyinventory", protectplayer, getenergyinventory)
    .post("/useenergyinventory", protectplayer, useenergyinventory)
    .post("/buyenergyinventory", protectplayer, buyenergyinventory)

module.exports = router;
