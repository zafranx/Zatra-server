const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        Type: {
            type: String,
            enum: ["Cart", "Wishlist"],
            required: true,
        },
        UserId: {
            type: mongoose.Schema.Types.ObjectId,
            // ref: "n_user_master",
        },
        ProductVariantIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "n_product_variant_master",
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("n_cart_and_wishlist", _SchemaDesign);
