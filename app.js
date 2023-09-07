require("dotenv").config();
require("./db");
const express = require("express");
const hbs = require("hbs");
const isLoggedIn = require("./middleware/isLoggedIn");
var cors = require("cors");

const app = express();
require("./config")(app);
app.use(
    cors({
        origin: [
            "http://127.0.0.1:3000",
            "https://127.0.0.1:3000",
            "http://localhost:8888",
            "https://localhost:8888",
        ],
    })
);

const capitalize = require("./utils/capitalize");
const projectName = "plant-iq";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );

    if (req.session.currentUser) {
        res.locals.currentUser = req.session.currentUser;
    }
    next();
});

// handling routes
const indexRoutes = require("./routes/index.routes");
app.use("/", indexRoutes);

const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const plantRoutes = require("./routes/plant.routes");
app.use("/plants", isLoggedIn, plantRoutes);

// To handle errors.
require("./error-handling")(app);

module.exports = app;
