const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        UserID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user_masters",
        },
        TripID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "trip_masters",
        },
        EventID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "event_masters",
        },
        RegCode: {
            type: String,
            // "Auto Generated for QR Code"
        },
        RegDate: {
            type: Date,
        },
        RegBy: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user_masters",
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("user_registration", SchemaDesign);
