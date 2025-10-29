const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        StationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "admin_lookups",
        },
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "n_product_master",
        },
        ProductVariantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "n_product_variant_master",
        },
        AssetId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "asset_master2",
        }, // Manufacturer

        IsActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("n_product_supplier_mapping", _SchemaDesign);
