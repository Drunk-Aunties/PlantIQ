const axios = require("axios");

//Sends a picture to the API and retrieves object for plant data
async function getIdentification(picture) {
    let result = await axios.get(`https://my-api.plantnet.org/v2/identify/all?images=${picture}&include-related-images=true&no-reject=false&lang=en&api-key=${process.env.PLANT_NET_API}`);
    return result.data;
}

module.exports = {getIdentification}
