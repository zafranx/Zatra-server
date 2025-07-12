const mongoose = require("mongoose");
// Product Inward Movement
const _SchemaDesign = new mongoose.Schema(
  {
    ProductVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product_variant_master",
    },
    LotNo: String,
    InputQuantity: Number,
    DateTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product_inward_movement", _SchemaDesign);
