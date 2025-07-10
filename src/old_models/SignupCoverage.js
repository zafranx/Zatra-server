const mongoose = require("mongoose");

const _lookupschema = new mongoose.Schema(
  {
    ApplicationID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookup",
    },
    PostalCode: {
      type: String,
    },
    AssetTypeID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookup",
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
module.exports = mongoose.model("signup_coverage", _lookupschema);
