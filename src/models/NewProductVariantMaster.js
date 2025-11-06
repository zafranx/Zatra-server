const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        VariantSKU: {
            type: String,
            unique: true,
            required: true,
            default: function () {
                // Generate SKU: Current Year + Random 6 digit number
                const year = new Date().getFullYear();
                const month = String(new Date().getMonth() + 1).padStart(
                    2,
                    "0"
                );
                const date = String(new Date().getDate()).padStart(2, "0");
                const random = Math.floor(100000 + Math.random() * 900000);
                return `V-SKU-${year}${month}${date}${random}`;
            },
        },
        ProductId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "n_product_master",
        },
        Color: String,
        Size: String,
        VariantInventory: { type: Number, default: 0 },
        PictureGallery: [String],
        VideoGallery: [String],
        IsActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);
// Add a pre-save middleware to ensure SKU is generated
_SchemaDesign.pre("save", async function (next) {
    if (!this.isNew) {
        return next();
    }

    // Keep trying to generate a unique SKU if there's a collision
    let isUnique = false;
    while (!isUnique) {
        const existingSKU =
            await mongoose.models.n_product_variant_master.findOne({
                VariantSKU: this.VariantSKU,
            });
        if (!existingSKU) {
            isUnique = true;
        } else {
            // Regenerate SKU if duplicate found
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, "0");
            const date = String(new Date().getDate()).padStart(2, "0");
            const random = Math.floor(100000 + Math.random() * 900000);
            this.VariantSKU = `V-SKU-${year}${month}${date}${random}`;
        }
    }
    next();
});
module.exports = mongoose.model("n_product_variant_master", _SchemaDesign);
