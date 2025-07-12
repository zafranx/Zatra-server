const mongoose = require("mongoose");
// product inventory master
const _SchemaDesign = new mongoose.Schema(
  {
    ProductVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product_variant_master",
    },
    LotNo: String,
    Quantity: Number,
  },
  { timestamps: true }
);
module.exports = mongoose.model("product_inventory_master", _SchemaDesign);
