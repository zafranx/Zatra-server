const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        VenueID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "venue_masters",
        },
        BoothID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "booth_masters",
        },
        EventID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "event_masters",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("venue_booth_map", SchemaDesign);
