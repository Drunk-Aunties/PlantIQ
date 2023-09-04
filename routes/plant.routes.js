const express = require("express");
const Plant = require("../models/Plant.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const fileUploader = require('../config/cloudinary.config');



const router = express.Router();

// GET: get all plants
router.get("/", (req, res, next) => {
    async function getAllPlantsPerUser() {
        const result = await Plant.find({ user: req.session.currentUser._id });
        res.render("plants/plants-list.hbs", { plants: result });
    }
    getAllPlantsPerUser();
});

// GET: get plant create form
router.get("/create", (req, res, next) => {
    console.log("in the create route...");
    res.render("plants/plant-create.hbs");
});

// POST: create new plant in DB
router.post("/create", fileUploader.single('picture'), (req, res, next) => {
    async function createNewPlant() {
        console.log(req.body);
        const result = await Plant.create({
            name:req.body.name,
            registrationDate: req.body.registrationDate,
            picture: req.file.path,
            user: req.session.currentUser._id
        });
        res.redirect(`/plants/${result._id}`);
    }
    createNewPlant();
});

// GET: get single plant details
router.get("/:plantId", (req, res, next) => {
    async function getPlantDetails() {
        const result = await Plant.findById({ _id: req.params.plantId });
        console.log(result);
        res.render("plants/plant-details.hbs", result);
    }
    getPlantDetails();
});

// POST: delete plant
router.get("/:plantId/delete", (req, res, next) => {
    async function deletePlant() {
        const result = await Plant.findByIdAndDelete(req.params.plantId);
        res.send("This is the plant deleted" + result);
    }
    deletePlant();
});

module.exports = router;
