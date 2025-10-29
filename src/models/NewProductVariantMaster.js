const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "n_product_master",
        },
        Color: String,
        Size: String,
        PictureGallery: [String],
        VideoGallery: [String],
        IsActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
module.exports = mongoose.model("n_product_variant_master", _SchemaDesign);
