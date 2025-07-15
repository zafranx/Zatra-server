//create a table Asset User (fields  Asset ID, Asset User ID, Name, Phone Number, Password)
// Asset User Master
const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
  {
    AssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
      required: true,
    },
    Name: { type: String, required: true },
    Phone: { type: Number, required: true },
    Password: { type: String, required: true },
    IsActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("asset_user_master", _SchemaDesign);