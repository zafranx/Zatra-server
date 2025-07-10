const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        ProductID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "products",
        },
        ValueType: {
            type: String,
            // String,Image,Video
        },
        ValueKey: {
            type: String,
        },
        Value: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("products_details", SchemaDesign);
