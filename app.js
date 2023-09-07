require("dotenv").config();
require("./db");
const express = require("express");
const hbs = require("hbs");
const isLoggedIn = require("./middleware/isLoggedIn");

const app = express();

require("./config")(app);

const capitalize = require("./utils/capitalize");
const projectName = "plant-iq";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

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
