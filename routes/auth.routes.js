const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const saltRounds = 10;

const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

// GET /auth/signup
router.get("/signup", isLoggedOut, (req, res) => {
    res.render("auth/signup");
});

// POST /auth/signup
router.post("/signup", isLoggedOut, (req, res) => {
    const { username, email, password } = req.body;
    if (username === "" || email === "" || password === "") {
        res.status(400).render("auth/signup", {
            errorMessage:
                "All fields are mandatory. Please provide your username, email and password.",
        });

        return;
    }
    if (password.length < 6) {
        res.status(400).render("auth/signup", {
            errorMessage:
                "Your password needs to be at least 6 characters long.",
        });

        return;
    }
    //   ! This regular expression checks password for special characters and minimum length
    /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(400)
      .render("auth/signup", {
        errorMessage: "Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter."
    });
    return;
  }
  */
    bcrypt
        .genSalt(saltRounds)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
            return User.create({ username, email, password: hashedPassword });
        })
        .then((user) => {
            res.redirect("/auth/login");
        })
        .catch((error) => {
            if (error instanceof mongoose.Error.ValidationError) {
                res.status(500).render("auth/signup", {
                    errorMessage: error.message,
                });
            } else if (error.code === 11000) {
                res.status(500).render("auth/signup", {
                    errorMessage:
                        "Email need to be unique. Provide a valid Email.",
                });
            } else {
                next(error);
            }
        });
});

// GET /auth/login
router.get("/login", isLoggedOut, (req, res) => {
    res.render("auth/login");
});

// POST /auth/login
router.post("/login", isLoggedOut, (req, res, next) => {
    const { username, email, password } = req.body;

    if (username === "" || email === "" || password === "") {
        res.status(400).render("auth/login", {
            errorMessage:
                "All fields are mandatory. Please provide username, email and password.",
        });

        return;
    }
    if (password.length < 6) {
        return res.status(400).render("auth/login", {
            errorMessage:
                "Your password needs to be at least 6 characters long.",
        });
    }

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.status(400).render("auth/login", {
                    errorMessage: "Wrong credentials.",
                });
                return;
            }

            bcrypt
                .compare(password, user.password)
                .then((isSamePassword) => {
                    if (!isSamePassword) {
                        res.status(400).render("auth/login", {
                            errorMessage: "Wrong credentials.",
                        });
                        return;
                    }
                    req.session.currentUser = user.toObject();
                    delete req.session.currentUser.password;
                    res.redirect("/");
                })
                .catch((err) => next(err));
        })
        .catch((err) => next(err));
});

// GET /auth/logout
router.get("/logout", isLoggedIn, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            res.status(500).render("auth/logout", {
                errorMessage: err.message,
            });
            return;
        }
        res.redirect("/");
    });
});

router.get("/user-profile", (req, res, next) => {
    const data = {
        currentUser: req.session.currentUser,
    };
    res.render("auth/user-profile", data);
});

module.exports = router;
