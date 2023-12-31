const { Schema, model } = require("mongoose");

const plantHistorySchema = new Schema(
    {
                category: String,
                description: String,
                date: String,
                plant: {
                    type: Schema.Types.ObjectId,
                    ref: "Plant",
                }
    },
    {
        timestamps: true,
    }
);

const PlantHistory = model("PlantHistory", plantHistorySchema);

module.exports = PlantHistory;
