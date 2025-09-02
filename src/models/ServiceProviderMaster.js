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
        ServiceType: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        ServiceProvider: {
            type: String,
        },
        ProfilePicture: {
            type: String, // URL/path to profile picture
        },
        ContactNumber: {
            type: String,
        },
        EmailAddress: {
            type: String,
        },
        Website: {
            type: String,
        },
        Facebook: {
            type: String,
        },
        Instagram: {
            type: String,
        },
        Youtube: {
            type: String,
        },
        PictureGallery: [
            {
                type: String, // Array of image URLs/paths
            },
        ],
        VideoGallery: [
            {
                type: String, // Array of video URLs/paths
            },
        ],
        VideosUrl: [
            {
                type: String, // Array of video URLs
            },
        ],
        IsVerified: {
            type: Boolean,
            default: false,
        },
        IsActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("service_provider_master", _SchemaDesign);
