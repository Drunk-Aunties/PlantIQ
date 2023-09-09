const express = require("express");
const router = express.Router();
const Plant = require("../models/Plant.model");
const { trefleGetPlantList, trefleGetPlantListByQuery } = require("../utils/apiTrefleIo");

//Variables essential for local storage of plants and paination display
let counter = 1;
let plantsArrRef = [];

router.use(async (req, res, next) => {
    try {
        next();
    } catch (error) {
        console.error("Error fetching plant data: " + error.message);
        next(error);
    }
});

//SEARCH: Gets query results from Trefleio API and displays them
router.get("/search", async (req, res) => {
    const query = req.query.query.toLowerCase();
    try {
        let plantsArrRef = await trefleGetPlantListByQuery(query);
        res.render("index", { plants: plantsArrRef, counter: counter });
    }
    catch (error) {
        console.error("Error fetching plant data by query: " + error.message);
        next(error);
    }
});

//GET INDEX: Get initial plant list from Trefle.Io
router.get("/", async (req, res) => {
    plantsArrRef = await trefleGetPlantList(counter);
    res.render("index", { plants: plantsArrRef, counter: counter, });
});

//GET INDEX NEXT: Refreshes plant list pagination 
router.get("/next", async (req, res) => {
    counter++;
    plantsArrRef = await trefleGetPlantList(counter);
    res.render("index", { plants: plantsArrRef, counter: counter });
});

//GET INDEX PREVIOUS: Refreshes plant list pagination 
router.get("/prev", async (req, res) => {
    counter--;
    if (counter < 1) { counter = 1 }
    plantsArrRef = await trefleGetPlantList(counter);
    res.render("index", { plants: plantsArrRef, counter: counter });
});

//GET: Displays plants details fetched from locally stored plant list
router.get("/list/:plantId", (req, res, next) => {
    const plantDetails = plantsArrRef.find((plant) => plant.id == req.params.plantId);
    if (plantDetails) {
        res.render("plants/api-plant-details.hbs", plantDetails);
    } else {
        res.status(404).send("Plant not found");
    }
});

//POST: Add Plant from Trefle.io to my Garden
router.post("/create/:plantId", async (req, res, next) => {
    try {
        //Gets plant data in locally stored array
        plantObject = plantsArrRef.find((plant) => plant.id == req.params.plantId);
        if (!plantObject) { throw new Error("No plant data found.") };

        //Creates Plant in MongoDB
        let result = await Plant.create({
            registrationDate: req.body.registrationDate,
            picture: plantObject.image_url,
            user: req.session.currentUser._id,
            name: plantObject.common_name,
            imageRecName: plantObject.scientific_name,
            genus: plantObject.genus,
            familyName: plantObject.family,
            commonNames: plantObject.commonNames,
        });
        res.redirect(`/plants/${result._id}`);
    }
    catch (error) {
        console.error("Error creating plant:", error.message);
        next(error);
    }
})

module.exports = router;
