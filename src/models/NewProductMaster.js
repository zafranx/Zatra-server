const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        ProductName: String,
        ShortDescription: String,
        LongDescription: String,
        PanchtatvaCategoryLevel1_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        PanchtatvaCategoryLevel2_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        PanchtatvaCategoryLevel3_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        Stations: [
            {
                StationsId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "admin_lookups",
                },
                StationsSpecialityId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "admin_lookups",
                },
            },
        ],
        AssetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "asset_master2",
        }, // Manufacturer
        BrandId: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "asset_master2",
        }, // ManufaBrand Mastercturer
        MrpWithCurrency: [
            {
                Currency: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "admin_lookups",
                },
                MRP: "",
            },
        ],
        DiscountWithCurrency: [
            {
                Currency: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "admin_lookups",
                },
                Discount: "",
            },
        ],
        IsActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
module.exports = mongoose.model("n_product_master", _SchemaDesign);
