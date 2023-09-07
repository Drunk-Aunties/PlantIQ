const { Schema, model } = require("mongoose");

const plantSchema = new Schema(
    {
        name: {
            type: String,
            required: false,
            trim: true,
        },
        imageRecName: String,
        familyName: String,
        species: String,
        genus: String,
        commonNames: [String],
        registrationDate: {
            type: String,
        },
        picture: {
            type: String,
        },
        history: [
            {
                category: String,
                description: String,
                date: Date,
            },
        ],
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

const Plant = model("Plant", plantSchema);

module.exports = Plant;
