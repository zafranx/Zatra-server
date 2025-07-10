const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        UserTypeID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        UserName: {
            type: String,
        },
        Gender: {
            type: String,
        },
        MobileNo: {
            type: Number,
        },
        EmailAddress: {
            type: String,
        },
        Address: {
            type: String,
        },
        CityID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        Trips: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "trip_masters",
            },
        ],
        Events: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "event_masters",
            },
        ],
        Cities: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "admin_lookups",
            },
        ],
        Events: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "event_masters",
            },
        ],
        IsActive: {
            type: Boolean,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("user_masters", SchemaDesign);
