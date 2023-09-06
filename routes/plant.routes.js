const express = require("express");
const Plant = require("../models/Plant.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const fileUploader = require("../config/cloudinary.config");
const https = require("https");
const router = express.Router();

const apiKey = "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";
const message = "Hello, ChatGPT!";

// GET: get all plants
router.get("/", (req, res, next) => {
    async function getAllPlantsPerUser() {
        const result = await Plant.find({ user: req.session.currentUser._id });
        res.render("plants/plants-list.hbs", { plants: result });
    }
    getAllPlantsPerUser();
});

// GET: get plant create form
router.get("/knowyourplant", (req, res, next) => {
    res.render("plants/plant-find.hbs");
});

// POST: create new plant in DB
router.post(
    "/knowyourplant",
    fileUploader.single("picture"),
    (req, res, next) => {
        function getIdentification(picture) {
            return fetch(
                `https://my-api.plantnet.org/v2/identify/all?images=${picture}&include-related-images=true&no-reject=false&lang=en&api-key=2b10pwICSS2Bx5QusceP0ioDHe`
            )
                .then((result) => result.json())
                .then((final) => {
                    return final;
                });
        }

        function together() {
            getIdentification(req.file.path)
                .then((plantType) => {
                    const recArr = plantType.results;
                    const name = plantType.bestMatch;
                    const organ = plantType.organ;
                    const takenImage = plantType.query.images[0];

                    const plantData = [];

                    recArr.forEach((element) => {
                        const images = element.images[0].url.m;
                        const scientificName =
                            element.species.scientificNameWithoutAuthor;
                        const score = element.score;
                        plantData.push({ scientificName, images, score });
                    });

                    res.render("plants/plant-find-list.hbs", {
                        plantData,
                        organ,
                        name,
                        takenImage,
                    });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).send("An error occurred.");
                });
        }
        together();
    }
);

// GET: get plant create form
router.get("/create", (req, res, next) => {
    console.log("in the create route...");
    res.render("plants/plant-create.hbs");
});

// POST: create new plant in DB
router.post("/create", fileUploader.single("picture"), (req, res, next) => {
    let plantType = "";

    function getIdentification(picture) {
        return fetch(
            `https://my-api.plantnet.org/v2/identify/all?images=${picture}&include-related-images=true&no-reject=false&lang=en&api-key=2b10pwICSS2Bx5QusceP0ioDHe`
        )
            .then((result) => result.json())
            .then((final) => {
                plantType = final;
                return final;
            });
    }

    function together() {
        getIdentification(req.file.path)
            .then((identifiedArray) => {
                const recArr = identifiedArray.results;
                const plantNames = [];
                recArr.forEach((element) => {
                    const scientificName =
                        element.species.scientificNameWithoutAuthor;
                    plantNames.push(scientificName);
                });

                const query = plantNames.toString();

                return new Promise((resolve, reject) => {
                    https.get(
                        `https://trefle.io/api/v1/plants?token=${process.env.MY_PLANT_KEY}&filter[scientific_name]=${query}`,
                        (resp) => {
                            let data = "";

                            resp.on("data", (chunk) => {
                                data += chunk;
                            });

                            resp.on("end", () => {
                                try {
                                    const jsonData = JSON.parse(data);
                                    resolve(jsonData.data);
                                } catch (error) {
                                    reject(error);
                                }
                            });

                            resp.on("error", (error) => {
                                reject(error);
                            });
                        }
                    );
                });
            })
            .then((plantsFromTrefle) => {
                const plantInfo = plantType.results[0];
                let today = new Date();
                today = today.toISOString().substr(0, 10);
                return Plant.create({
                    name: req.body.name,
                    registrationDate: today,
                    picture: req.file.path,
                    user: req.session.currentUser._id,
                    species: plantInfo.species.scientificNameWithoutAuthor,
                    genus: plantInfo.species.genus.scientificNameWithoutAuthor,
                    familyName:
                        plantInfo.species.family.scientificNameWithoutAuthor,
                    commonNames: plantInfo.species.commonNames,
                    imageRecName: plantType.bestMatch,
                });
            })
            .then((result) => {
                res.redirect(`/plants/${result._id}`);
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send("An error occurred.");
            });
    }

    together();
});

// GET: get single plant details
router.get("/:plantId", (req, res, next) => {
    async function getPlantDetails() {
        const result = await Plant.findById({ _id: req.params.plantId });
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
