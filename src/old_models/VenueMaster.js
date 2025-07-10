const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        VenueName: {
            type: String,
        },
        AddressID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "address_master",
        },
        // AddressMaster se address lenge
        // Address: {
        //     type: String,
        // },
        // GeoAddress: {
        //     type: { type: String, enum: ["Point"], default: "Point" },
        //     coordinates: { type: [Number], required: true }, // [longitude, latitude]
        // },
    },
    {
        timestamps: true,
    }
);
// SchemaDesign.index({ GeoAddress: "2dsphere" });

module.exports = mongoose.model("venue_masters", SchemaDesign);
