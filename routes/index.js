const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./Auth"))
    app.use("/dashboard", require("./Dashboard"))
    app.use("/personal", require("./Personal"))
    app.use("/tools", require("./Tools"))
    app.use("/clocks", require("./Clock"))
    app.use("/cosmetics", require("./Cosmetics"))
    app.use("/energy", require("./Energy"))
    app.use("/energyinventory", require("./Energyinventory"))
}

module.exports = routers