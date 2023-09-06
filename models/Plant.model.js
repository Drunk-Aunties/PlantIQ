const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
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
            type: Date,
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
        // this second object adds extra properties: `createdAt` and `updatedAt`
        timestamps: true,
    }
);

const Plant = model("Plant", plantSchema);

module.exports = Plant;
