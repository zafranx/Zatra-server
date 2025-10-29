const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        AssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_master",
        },
        BrandName: String,
        Logo: String,
        PictureGallery: String,
        Wordmark: String,
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("n_brand_master", _SchemaDesign);
