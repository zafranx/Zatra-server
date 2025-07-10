const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
  {
    ProductTypeID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    ProductDesc: {
      type: String,
    },
    ProductPictures: Array,
    MRP: Number,
    ProductCategoryID: {
      type: mongoose.SchemaTypes.ObjectId,
      // ref: "trip_masters",
    },
    ProductSubCategoryID: {
      type: mongoose.SchemaTypes.ObjectId,
      // ref: "event_masters",
    },
    MaxCapPrice: Number,
    ForExhibition: Boolean,
    // ForExhibition: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   // ref: "user_masters",
    //   // If True then pick ExhibitorID else Asset ID
    // },
    ExhibitorID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "exhibitor_masters",
    },
    AssetID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_masters",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("products", SchemaDesign);
