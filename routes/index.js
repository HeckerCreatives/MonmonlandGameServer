const routers = app => {
    console.log("Routers are all available");

    app.use("/auth", require("./Auth"))
    app.use("/dashboard", require("./Dashboard"))
    app.use("/personal", require("./Personal"))
}

module.exports = routers