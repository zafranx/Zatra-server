const mongoose = require("mongoose");

const DestinationsSchema = new mongoose.Schema({
    CityID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
    },
    // DestinationId: {
    //     type: mongoose.SchemaTypes.ObjectId,
    // },
    // AssetID: {
    //     type: mongoose.SchemaTypes.ObjectId,
    //     ref: "asset_masters",
    // },
});
const SchemaDesign = new mongoose.Schema(
    {
        TripName: {
            type: String,
        },
        TripTypeID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        TripCategoryID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        Destinations: [DestinationsSchema],
        FromDate: {
            type: Date,
        },
        ToDate: {
            type: Date,
        },
        Remarks: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("trip_masters", SchemaDesign);
