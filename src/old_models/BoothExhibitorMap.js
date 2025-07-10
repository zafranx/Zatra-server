const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        BoothID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "booth_masters",
        },
        VBMapID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "venue_booth_map",
        },
        AssignedOn: {
            type: Date,
        },
        AssignedBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user_masters",
        },
        ExhibitorID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "exhibitor_masters",
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("booth_exhibitor_map", SchemaDesign);
