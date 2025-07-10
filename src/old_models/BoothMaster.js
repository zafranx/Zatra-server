const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        BoothName: {
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
        BoothCode: {
            type: String,
        },
        Floor: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);
SchemaDesign.index({ GeoAddress: "2dsphere" });

module.exports = mongoose.model("booth_masters", SchemaDesign);
