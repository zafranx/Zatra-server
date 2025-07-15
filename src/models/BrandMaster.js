// Brand Master (Brand Type ID, Brand ID, Brand Name, Description,
//  Upload Brand Images, Brand Broucher (PDF), Legal Entity ID)

// new table:
// Brand Master Table fields (Brand Associated with, Asset ID, Product ID, Brand Type ID, 
// Brand Image, Brand Text, Brand Advertisements, Brand Videos, Comments)

const mongoose = require("mongoose");
// Brand master
const _SchemaDesign = new mongoose.Schema(
  {
    BrandAssociatedWith: {
      type: mongoose.SchemaTypes.ObjectId,
      // ref: "asset_user_master",
      refPath: "CreatedRef", // Use refPath for dynamic reference
      require: true,
    },
    CreatedRef: {
      type: String, // This should contain the collection name, e.g., "asset_user_master", "", etc.Asset_master,
      require: true,
    },
    AssetId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "asset_master",
    },
    ProductId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "product_master",
    },
    BrandTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
    BrandImage: String,
    BrandText: String,
    BrandAdvertisements: String,
    BrandVideos: String,
    Comments: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("brand_master", _SchemaDesign);
