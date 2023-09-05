const express = require("express");
const Plant = require("../models/Plant.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const fileUploader = require("../config/cloudinary.config");

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
                .then((final) => final.results);
        }

        function together() {
            getIdentification(req.file.path)
                .then((plantType) => {
                    const underResult = plantType.map((element) => {
                        const images = element.images[0].url.m; // Assuming you want the first image URL
                        const organ = element.organ;
                        const scientificName =
                            element.species.scientificNameWithoutAuthor;
                        const score = element.score;
                        return { scientificName, organ, images, score };
                    });

                    res.render("plants/plant-find-list.hbs", { underResult });
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
            `https://my-api.plantnet.org/v2/identify/all?images=${picture}&include-related-images=false&no-reject=false&lang=en&api-key=2b10pwICSS2Bx5QusceP0ioDHe`
        )
            .then((result) => result.json())
            .then((final) => {
                plantType = final;
                console.log(final);
                return final;
            });
    }

    function createNewPlant() {
        console.log(req.body);
        return Plant.create({
            name: req.body.name,
            registrationDate: req.body.registrationDate,
            picture: req.file.path,
            user: req.session.currentUser._id,
            imageRecName: plantType.bestMatch,
        });
    }

    function together() {
        getIdentification(req.file.path)
            .then(() => createNewPlant())
            .then((result) => {
                res.redirect(`/plants/${result._id}`);
            })
            .catch((error) => {
                // Handle any errors that occurred in either of the functions
                console.error(error);
                // You may want to send an error response to the client here
                res.status(500).send("An error occurred.");
            });
    }

    together();
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
