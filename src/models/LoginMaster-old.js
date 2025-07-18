const mongoose = require("mongoose");

const _LoginMasterOld = new mongoose.Schema(
    {
        AssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        UserId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user_masters",
        },
        AssetTypeId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        UserName: {
            type: String,
        },
        LoginId: {
            type: String,
        },
        Pwd: {
            type: String,
        },
        ParentAssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        IsFirstLogin: {
            type: Boolean,
            default: true,
        },
        SecQues1: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        SecQues2: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        Ans1: { type: String },
        Ans2: { type: String },
        IsLocked: {
            type: Boolean,
        },
        IsDisabled: {
            type: Boolean,
        },
        MPIN: {
            type: String,
        },
        IsAdmin: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("login_master_old", _LoginMasterOld);
