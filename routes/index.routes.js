const express = require("express");
const router = express.Router();
const https = require("https");

async function fetchPlantData() {
    return new Promise((resolve, reject) => {
        https.get(
            `https://trefle.io/api/v1/plants?token=${process.env.MY_PLANT_KEY}`,
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
}

router.use(async (req, res, next) => {
    try {
        const plantsArray = await fetchPlantData();
        res.locals.plantsArray = plantsArray;
        next();
    } catch (error) {
        console.error("Error fetching plant data: " + error.message);
        next(error);
    }
});

router.get("/", (req, res) => {
    res.render("index", {
        plants: res.locals.plantsArray,
    });
});

router.get("/list/:plantId", (req, res, next) => {
    const plantId = req.params.plantId;
    const plantDetails = res.locals.plantsArray.find(
        (plant) => plant.id == plantId
    );

    if (plantDetails) {
        res.render("plants/api-plant-details.hbs", plantDetails);
    } else {
        res.status(404).send("Plant not found");
    }
});

module.exports = router;
