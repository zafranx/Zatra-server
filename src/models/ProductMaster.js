// Product Master (Product Category ID, Product Sub Category ID, Product ID, Product Name,
//  Short Description, Long Description, Legal Entity ID, Brand ID, Image Gallery, Video Gallery)
const mongoose = require("mongoose");
// product master
const _SchemaDesign = new mongoose.Schema(
  {
    LegalEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "legal_entity",
    }, // LegalEntityID means AssetID
    CategoryId: { type: mongoose.Schema.Types.ObjectId, ref: "admin_lookups" },
    SubCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin_lookups",
    },
    BrandId: { type: mongoose.Schema.Types.ObjectId, ref: "brands_master" },
    ProductName: String,
    ShortDesc: String,
    LongDesc: String,
    // MRP: { type: Number },
    // Discounts: { type: Number },
    // OfferPrice: { type: Number },
    ProductImages: [{ type: String }],
    ProductVideos: [{ type: String }],
    IsActive: { type: Boolean },
  },
  { timestamps: true }
);
module.exports = mongoose.model("product_master", _SchemaDesign);
