const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "n_user_master",
        },
        Products: [
            {
                ProductVariantId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "n_product_variant_master",
                },
                AssetId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "asset_master2",
                    //  (Supplier)
                },
                SourceStationId: {
                    type: mongoose.Schema.Types.ObjectId,
                    // ref: "admin_lookups",
                    //  (Supplier Station)
                },
                InventoryId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "n_inverntory_master",
                },
                OrderQuantity: String,
            },
        ],
        ShippingAddress: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "",
        },
        DestinationStationId: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "admin_lookups",
            // (Buyer Station)
        },
        TransactionID: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "",
            // (for Financial Transaction)
        },
        OrderValue: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("n_order_master", _SchemaDesign);
