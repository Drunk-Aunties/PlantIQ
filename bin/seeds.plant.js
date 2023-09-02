const mongoose = require('mongoose');
const Plant = require('../models/Plant.model');
const User = require('../models/User.model')

require('dotenv').config(); // import and configure dotenv (loads environment variables from .env file)

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/plant-iq';

let plants = []

async function createData() {
    let userRef = await User.findOne(); 
    plants = [
        {
            name: "Bob",
            description:
                "Bob is a bonsai bought in IKEA in May 2019. ",
            picture: "https://www.meingartenshop.de/media/catalog/product/cache/3a7af0a8e0e317723249dc9098669163/f/d/fd19767wh.jpg",
            registrationDate: "2023-08-25",
            history: [{
                category: "Watering",
                description: "",
                date: "2023-08-25"
            }],
            user: userRef._id
        },
        {
            name: "Orca",
            description:
                "Orca is an orchid gotten as a birthday gift. ",
            picture: "https://cdn.shopify.com/s/files/1/0150/6262/products/the_sill-variant-white_gloss-orchid_purple.jpg?v=1680542287",
            registrationDate: "2023-07-15",
            history: [{
                category: "Watering",
                description: "",
                date: "2023-08-25"
            },
            {
                category: "Watering",
                description: "",
                date: "2023-08-26"
            },
            {
                category: "Watering",
                description: "",
                date: "2023-08-26"
            },
            {
                category: "Observation",
                description: "Yellow Leaves",
                date: "2023-08-27"
            },
            {
                category: "Picture",
                description: "https://www.gardenia.net/storage/app/public/uploads/images/detail/A0z5CJPN0iaF8xzfckGEX6GLaW1FbbJfq362QFoy.webp",
                date: "2023-08-27"
            }],
            user: userRef._id
        },
        {
            name: "Sunnies",
            description:
                "Sunnies are the sunflowers planted in my garden.",
            picture: "https://cdn.shopify.com/s/files/1/0150/6262/products/the_sill-variant-white_gloss-orchid_purple.jpg?v=1680542287",
            registrationDate: "2023-07-15",
            history: [{
                category: "Watering",
                description: "",
                date: "2023-08-25"
            },
            {
                category: "Watering",
                description: "",
                date: "2023-08-26"
            },
            {
                category: "Watering",
                description: "",
                date: "2023-08-26"
            },
            {
                category: "Observation",
                description: "Snails and fungus on the roots",
                date: "2023-08-30"
            },
            {
                category: "Observation",
                description: "Heavy rain in the area",
                date: "2023-08-28"
            },
            {
                category: "Picture",
                description: "https://www.gardenia.net/storage/app/public/uploads/images/detail/A0z5CJPN0iaF8xzfckGEX6GLaW1FbbJfq362QFoy.webp",
                date: "2023-08-27"
            }],
            user: userRef._id
        },
    ];

}

async function executeSeed() {
try {
    let result = await mongoose.connect(MONGO_URI);
    console.log(`Connected to Mongo! Database name: "${result.connections[0].name}"`);
    result = await Plant.deleteMany({});
    console.log(result);
    await createData();
    result = await Plant.insertMany(plants);
    console.log(`Created ${result.length} plants`);
    await mongoose.connection.close();

}
catch(err) {console.error("Error connecting to DB: ", err);};
}

executeSeed();
