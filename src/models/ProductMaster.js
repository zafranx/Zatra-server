// Product Master (Product Category ID, Product Sub Category ID, Product ID, Product Name,
//  Short Description, Long Description, Legal Entity ID, Brand ID, Image Gallery, Video Gallery)
const mongoose = require("mongoose");
// product master
const _SchemaDesign = new mongoose.Schema(
    {
        AssetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "asset_master2",
        }, // LegalEntityID means AssetID
        BrandId: { type: mongoose.Schema.Types.ObjectId, ref: "admin_lookups" },
        CategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        SubCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        BrandId: { type: mongoose.Schema.Types.ObjectId, ref: "brand_master" },
        ProductName: String,
        ShortDesc: String,
        LongDesc: String,
        Price: String,
        DiscountedPrice: String,
        WeightAndDimensions: String,
        StockQuantity: String,
        ProductImages: [{ type: String }],
        ProductVideos: [{ type: String }],

        // 9. Business Mapping
        BrandsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        ODOPMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        VocalForLocal: { type: Boolean },
        ExportsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalCropsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalProductsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalSweetsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalSnacksMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalCuisineMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalSpicesMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalFoodsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        IsActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
module.exports = mongoose.model("product_master", _SchemaDesign);
