const mongoose = require("mongoose");
const { Schema } = mongoose;

const _SchemaDesign = new Schema(
    {
        LoginAssetType: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        LoginAssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            refPath: "LoginAssetRef",
        },
        LoginAssetRef: {
            type: String,
            // enum: ["admin_lookups", "asset_master", "zatra_master", "user_master", "destination_master"],
        },
        Name: String,
        Email: String,
        Address: String,
        PhoneNumber: String,
        Password: String,
        IsActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("new_zatra_login_master", _SchemaDesign);
