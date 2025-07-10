const mongoose = require("mongoose");
// const { ProductCategory } = require("./AssetMaster");
const ProductCategorySchema = new mongoose.Schema({
    CategoryName: {
        type: String,
    },
});
const ProductSubCategorySchema = new mongoose.Schema({
    CategoryID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "exhibitor_product_category",
    },
    SubCategoryName: {
        type: String,
    },
});
const SchemaDesign = new mongoose.Schema(
    {
        EventID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "event_masters",
        },
        ExhibitorTypeID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        ExhibitorName: {
            type: String,
        },
        Website: {
            type: String,
        },
        EmailAddress: {
            type: String,
        },
        AddressID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "address_master",
        },
        CityID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        AssetID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        ProductCategories: [ProductCategorySchema],
        ProductSubCategories: [ProductSubCategorySchema],
    },
    {
        timestamps: true,
    }
);
// module.exports = mongoose.model("exhibitor_masters", SchemaDesign);
const ExhibitorMaster = mongoose.model("exhibitor_masters", SchemaDesign);
const ProductCategory = mongoose.model(
    "exhibitor_product_category",
    ProductCategorySchema
);

module.exports = { ExhibitorMaster, ProductCategory };
