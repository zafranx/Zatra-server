const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        ProductID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "products",
        },
        OfferBanner: {
            type: String,
        },
        OfferPrice: {
            type: Number,
        },
        DiscountPercent: {
            type: Number,
        },
        ValidTill: {
            type: Date,
        },
        ProductMRP: {
            type: Number,
        },
        OfferDesc: {
            type: String,
        },
        NeverExpire: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("offers", SchemaDesign);
