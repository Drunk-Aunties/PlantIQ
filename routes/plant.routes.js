const express = require("express");

const Plant = require("../models/Plant.model");
const PlantHistory = require("../models/PlantHistory.model");

const fileUploader = require("../config/cloudinary.config");
const router = express.Router();

const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const { formatDate } = require("../utils/generalFunctions");

const { getIdentification } = require("../utils/apiPlantNet");

//GET: Send all plant data to Chat GPT and gets response
router.get("/:plantId/chat", async (req, res, next) => {
    try {
        const plantData = await Plant.findById({ _id: req.params.plantId });
        const PlantInfo = await PlantHistory.findById({ _id: req.params.plantId });
        const userMessage = {
            role: "user",
            content: `Hi, I will ask you a question, please answer like a gardener. 
            My plant has the following characteristics, ${JSON.stringify(plantData)}, 
            and following extra information ${JSON.stringify(PlantInfo)} 
            Can you give information about my plant and an advice for me but you should explain it by using only 100 words.`,
        };
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [userMessage],
            max_tokens: 250,
        });
        const response = chatCompletion.choices[0].message.content;
        res.render("plants/plant-chatbot.hbs", { response });
    } catch (error) {
        console.error("Error in /chat route:", error);
        res.status(500).send("An error occurred.");
    }
});

// GET: populates My Garden section with all plants for current user
router.get("/", async (req, res, next) => {
    const result = await Plant.find({ user: req.session.currentUser._id });
    res.render("plants/plants-list.hbs", { plants: result });
});

// GET: Know Your Plant AI image recognition Form page
router.get("/knowyourplant", (req, res, next) => {
    res.render("plants/plant-find.hbs");
});

// POST: Know Your Plant AI image recognition Result page
router.post("/knowyourplant", fileUploader.single("picture"), async (req, res, next) => {
    try {
        let result = await getIdentification(req.file.path);
        console.log(result)
        //extracts fields from API's response
        const name = result.bestMatch;
        const organ = result.organ;
        const takenImage = result.query.images[0];
        const recArr = result.results

        //Creates array of similar plants
        const similarPlants = [];
        recArr.forEach((element) => {
            const images = element.images[0].url.m;
            const scientificName = element.species.scientificNameWithoutAuthor;
            const score = element.score;
            similarPlants.push({ scientificName, images, score });
        });

        //Renders view with all info
        res.render("plants/plant-find-list.hbs", { similarPlants, organ, name, takenImage })
    }
    catch (error) { res.status(500).send("An error occurred.") }
});

// GET: get plant create form
router.get("/create", (req, res, next) => {
    res.render("plants/plant-create.hbs");
});

// POST: create new plant based on picture recognition
router.post("/create", fileUploader.single("picture"), async (req, res, next) => {
    try {
        //Get results from API Image Recognition
        let result = await getIdentification(req.file.path);
        //Isolates nested best match object
        let plant = result.results[0];

        //Creates plant in Mongo DB
        let createdPlant = await Plant.create({
            name: req.body.name,
            registrationDate: formatDate(new Date()),
            picture: req.file.path,
            user: req.session.currentUser._id,
            species: plant.species.scientificNameWithoutAuthor,
            genus: plant.species.genus.scientificNameWithoutAuthor,
            familyName: plant.species.family.scientificNameWithoutAuthor,
            commonNames: plant.species.commonNames,
            imageRecName: result.bestMatch,
        });
        res.redirect(`/plants/${createdPlant._id}`);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("An error occurred.");
    }
});

// GET: get single plant details
router.get("/:plantId", async (req, res, next) => {
    const result = await Plant.findById({ _id: req.params.plantId });
    const history = await PlantHistory.find({ plant: req.params.plantId });
    result.history = history;
    res.render("plants/plant-details.hbs", result);
});

// GET: delete plant
router.get("/:plantId/delete", async (req, res, next) => {
    await Plant.findByIdAndDelete(req.params.plantId);
    res.redirect("/plants");
});

// GET: edit plant
router.get("/:plantId/edit", async (req, res, next) => {
    const result = await Plant.findById(req.params.plantId);
    res.render("plants/plant-edit.hbs", result);
});

// POST: edit plant
router.post("/:plantId/edit", async (req, res, next) => {
    const result = await Plant.findByIdAndUpdate(req.params.plantId, req.body);
    res.redirect(`/plants/${req.params.plantId}`);
});

// POST: Add Plant History document
router.post("/:plantId/addevent", async (req, res, next) => {
    await PlantHistory.create({
        category: req.body.category,
        description: req.body.description,
        date: formatDate(new Date()),
        plant: req.params.plantId,
    });
    res.redirect(`/plants/${req.params.plantId}`);
});

module.exports = router;
