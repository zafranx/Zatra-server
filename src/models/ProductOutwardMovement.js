const mongoose = require("mongoose");
// Product Outward Movement
const _SchemaDesign = new mongoose.Schema(
  {
    ProductVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product_variant_master",
    },
    LotNo: String,
    DamagedQty: { type: Number, default: 0 },
    SaleQty: { type: Number, default: 0 },
    TheftQty: { type: Number, default: 0 },
    MissingQty: { type: Number, default: 0 },
    DateTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product_outward_movement", _SchemaDesign);
