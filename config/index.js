const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const favicon = require("serve-favicon");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Connects the mongo uri to maintain the same naming structure
const MONGO_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/plant-iq";

// Middleware configuration
module.exports = (app) => {
    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    // Normalizes the path to the views folder
    app.set("views", path.join(__dirname, "..", "views"));
    // Sets the view engine to handlebars
    app.set("view engine", "hbs");
    // Handles access to the public folder
    app.use(express.static(path.join(__dirname, "..", "public")));

    // Handles access to the favicon
    app.use(
        favicon(path.join(__dirname, "..", "public", "images", "favicon.ico"))
    );

    app.use(
        session({
            secret: process.env.SESSION_SECRET || "super hyper secret key",
            resave: false,
            saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: MONGO_URI,
            }),
        })
    );
};
