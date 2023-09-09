const https = require("https");

//Returns a list of plants from the API
async function trefleGetPlantList(page) {
    return new Promise((resolve, reject) => {
        https.get(`https://trefle.io/api/v1/plants?token=${process.env.MY_PLANT_KEY}&page=${page}`,
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

//Returns a list of plants from the API based on a given query
async function trefleGetPlantListByQuery(query) {
    return new Promise((resolve, reject) => {
        https.get(
            `https://trefle.io/api/v1/plants/search?token=${process.env.MY_PLANT_KEY}&q=${query}`,
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

module.exports = {trefleGetPlantList, trefleGetPlantListByQuery}

