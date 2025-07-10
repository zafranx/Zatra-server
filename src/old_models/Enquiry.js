const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        ExhibitorID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "exhibitor_masters",
        },
        AssetID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        FromExhibition: {
            type: Boolean,
            default: false,
        },
        UserID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user_masters",
        },
        EnquiryDate: {
            type: Date,
        },
        ProductID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "products",
        },
        Qty: {
            type: Number,
        },
        StatusID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        EnquiryValue: {
            type: Number,
        },
        DeliveryAddress: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("enquiry", SchemaDesign);
