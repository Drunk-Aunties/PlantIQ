const express = require("express");
const router = express.Router();
const https = require("https");

let counter = 1;

async function fetchPlantData(page) {
    return new Promise((resolve, reject) => {
        https.get(
            `https://trefle.io/api/v1/plants?token=${process.env.MY_PLANT_KEY}&page=${page}`,
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
        const plantsArray = await fetchPlantData(counter);
        res.locals.plantsArray = plantsArray;
        next();
    } catch (error) {
        console.error("Error fetching plant data: " + error.message);
        next(error);
    }
});

router.get("/search", async (req, res) => {
    const query = req.query.query.toLowerCase();

    async function fetchPlantDataByQuery(query) {
        return new Promise((resolve, reject) => {
            https.get(
                `https://trefle.io/api/v1/plants?token=${process.env.MY_PLANT_KEY}&filter[common_name]=${query}`,
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

    try {
        const plantsArray = await fetchPlantDataByQuery(query);
        console.log(plantsArray);
        res.render("index", {
            plants: plantsArray,
            counter: counter,
        });
    } catch (error) {
        console.error("Error fetching plant data by query: " + error.message);
        next(error);
    }
});

router.get("/", (req, res) => {
    res.render("index", {
        plants: res.locals.plantsArray,
        counter: counter,
    });
});

router.get("/next", async (req, res) => {
    counter++;
    const plantsArray = await fetchPlantData(counter);
    res.render("index", {
        plants: plantsArray,
        counter: counter,
    });
});

router.get("/prev", async (req, res) => {
    counter--;
    if (counter < 1) {
        counter = 1; // Ensure the counter doesn't go below 1
    }
    const plantsArray = await fetchPlantData(counter);
    res.render("index", {
        plants: plantsArray,
        counter: counter,
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
