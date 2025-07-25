const mongoose = require("mongoose");

const _LoginMaster = new mongoose.Schema(
  {
    AssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_masters",
    },
    // UserId: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "user_masters",
    // },
    RoleTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    // AssetTypeId: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "admin_lookups",
    // },
    UserName: {
      type: String,
    },
    PhoneNumber: String,
    LoginId: {
      type: String,
    },
    Pwd: {
      type: String,
    },
    Age: String,
    Sex: String,
    EmailAddress: String,
    Address: String,
    ReferredBy: String,
    IsFirstLogin: {
      type: Boolean,
      default: true,
    },
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
    // ParentAssetId: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "asset_masters",
    // },
    // SecQues1: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "admin_lookups",
    // },
    // SecQues2: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "admin_lookups",
    // },
    // Ans1: { type: String },
    // Ans2: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("login_master", _LoginMaster);
