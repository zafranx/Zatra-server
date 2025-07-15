const mongoose = require("mongoose");
// product variant master
const _SchemaDesign = new mongoose.Schema(
  {
    AssetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "asset_master",
    },
    ProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product_master",
    }, // LegalEntityID means AssetID
    ProductVariantName: String,
    ModelNumber: String, // Product Variant Code/ Model Number
    ShortDesc: String,
    LongDesc: String,
    MRP: { type: Number },
    Only_for_B2B_Sale: Boolean,
    // Discounts: { type: Number },
    // OfferPrice: { type: Number },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product_variant_master", _SchemaDesign);
