const mongoose = require("mongoose");
const ProductCategorySchema = new mongoose.Schema({
    CategoryName: {
        type: String,
    },
});
const ProductSubCategorySchema = new mongoose.Schema({
    CategoryID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "product_category",
    },
    SubCategoryName: {
        type: String,
    },
});
const SchemaDesign = new mongoose.Schema(
    {
        AssetCategoryID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        AssetSubCategoryID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        SubCategoryTypeID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        AssetName: {
            type: String,
        },
        CityID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        CityGroupID: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        }],
        AddressID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "address_master",
        },
        ShortDesc: {
            type: String,
        },
        LongDesc: {
            type: String,
        },
        CurrentMRP: {
            type: Number,
        },
        PictureGalleryID: {
            type: mongoose.SchemaTypes.ObjectId,
        },
        VideoGalleryID: {
            type: mongoose.SchemaTypes.ObjectId,
        },
        ProductCategories: [ProductCategorySchema],
        ProductSubCategories: [ProductSubCategorySchema],
    },
    {
        timestamps: true,
    }
);

// module.exports = mongoose.model("asset_masters", SchemaDesign);
// module.exports = mongoose.model("product_category", ProductCategorySchema);

const AssetMaster = mongoose.model("asset_masters", SchemaDesign);
const ProductCategory = mongoose.model(
    "product_category",
    ProductCategorySchema
);

module.exports = { AssetMaster, ProductCategory };
