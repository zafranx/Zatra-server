const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        EventID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "event_masters",
        },
        VenueID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "venue_masters",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("event_venue_map", SchemaDesign);
