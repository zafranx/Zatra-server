const mongoose = require("mongoose");
const _SchemaDesign = new mongoose.Schema(
    {
        ProductSKU: {
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
                return `P-SKU-${year}${month}${date}${random}`;
            },
        },
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
            ref: "n_brand_master",
        }, // ManufaBrand Mastercturer
        MrpWithCurrency: [
            {
                Currency: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "admin_lookups",
                },
                MRP: String,
            },
        ],
        DiscountWithCurrency: [
            {
                Currency: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "admin_lookups",
                },
                Discount: String,
            },
        ],
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
        const existingSKU = await mongoose.models.n_product_master.findOne({
            ProductSKU: this.ProductSKU,
        });
        if (!existingSKU) {
            isUnique = true;
        } else {
            // Regenerate SKU if duplicate found
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, "0");
            const date = String(new Date().getDate()).padStart(2, "0");
            const random = Math.floor(100000 + Math.random() * 900000);
            this.ProductSKU = `P-SKU-${year}${month}${date}${random}`;
        }
    }
    next();
});

module.exports = mongoose.model("n_product_master", _SchemaDesign);
