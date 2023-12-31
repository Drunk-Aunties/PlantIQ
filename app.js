require("dotenv").config();
require("./db");
const express = require("express");
const hbs = require("hbs");
const isLoggedIn = require("./middleware/isLoggedIn");

const app = express();
require("./config")(app);

const projectName = "Plant-IQ";

app.locals.appTitle = `${projectName}`;
app.use((req, res, next) => {
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
