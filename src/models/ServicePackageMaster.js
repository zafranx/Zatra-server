const mongoose = require("mongoose");

const _SchemaDesign = new mongoose.Schema(
    {
        ZatraId: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref: "admin_lookups",
        },
        StationId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        AssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_master2",
        },
        PackageType: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        Currency: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        PakageTitle: String,
        PakageDescripton: String,
        PakagePrice: String,
        DiscountPrice: String,
        PakagePoster: String,
        PakageVideo: String,
        PictureGallery: [String],
        VideoGallery: [String],
        IsActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("service_package_master", _SchemaDesign);
