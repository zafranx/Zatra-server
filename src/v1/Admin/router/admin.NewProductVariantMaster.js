const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
    __SUCCESS,
    __RECORD_NOT_FOUND,
    __SOME_ERROR,
} = require("../../../utils/variable");
const ProductVariant = require("../../../models/NewProductVariantMaster");

// ✅ Add / Edit Product Variant
router.post("/SaveProductVariant", async (req, res) => {
    try {
        const {
            _id,
            ProductId,
            Color,
            Size,
            VariantInventory,
            PictureGallery = [],
            VideoGallery = [],
            IsActive = true,
        } = req.body;

        // Build Save Data
        const saveData = {
            ProductId: mongoose.Types.ObjectId(ProductId),
            Color,
            Size,
            VariantInventory,
            PictureGallery,
            VideoGallery,
            IsActive,
        };

        if (!_id) {
            // ADD New Variant
            const newVariant = await ProductVariant.create(saveData);
            await __CreateAuditLog(
                "n_product_variant_master",
                "ProductVariant.Add",
                null,
                null,
                saveData,
                newVariant._id
            );
            return res.json(__requestResponse("200", __SUCCESS, newVariant));
        } else {
            // EDIT Existing Variant
            const oldVariant = await ProductVariant.findById(_id);
            if (!oldVariant)
                return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

            await ProductVariant.updateOne({ _id }, { $set: saveData });
            await __CreateAuditLog(
                "n_product_variant_master",
                "ProductVariant.Edit",
                null,
                oldVariant,
                saveData,
                _id
            );
            return res.json(__requestResponse("200", __SUCCESS, saveData));
        }
    } catch (error) {
        console.error("❌ Error in SaveProductVariant:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

// ✅ Delete Product Variant
router.post("/deleteProductVariant", async (req, res) => {
    try {
        const { ProductVariantId } = req.body;
        const deleted = await ProductVariant.findByIdAndDelete(
            ProductVariantId
        );

        if (!deleted)
            return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        await __CreateAuditLog(
            "n_product_variant_master",
            "ProductVariant.Delete",
            null,
            deleted,
            null,
            ProductVariantId
        );

        return res.json(
            __requestResponse("200", "Product Variant deleted successfully")
        );
    } catch (error) {
        console.error("❌ Error in deleteProductVariant:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

// ✅ List Product Variants (with pagination + filter + search)
router.post("/listProductVariants", async (req, res) => {
    try {
        const {
            ProductId,
            Color,
            Size,
            search,
            page = 1,
            limit = 10,
        } = req.body;

        const parsedPage = Math.max(parseInt(page) || 1, 1);
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (ProductId) filter.ProductId = ProductId;
        if (Color) filter.Color = { $regex: Color, $options: "i" };
        if (Size) filter.Size = { $regex: Size, $options: "i" };

        if (search) {
            filter.$or = [
                { Color: { $regex: search, $options: "i" } },
                { Size: { $regex: search, $options: "i" } },
                { VariantSKU: { $regex: search, $options: "i" } },
            ];
        }

        const [data, total] = await Promise.all([
            ProductVariant.find(filter)
                .populate("ProductId", "ProductName ProductSKU")
                .sort({ createdAt: -1 })
                // .skip(skip)
                // .limit(parsedLimit)
                .lean(),
            ProductVariant.countDocuments(filter),
        ]);

        return res.json(
            __requestResponse("200", __SUCCESS, {
                total,
                // page: parsedPage,
                // limit: parsedLimit,
                list: __deepClone(data),
            })
        );
    } catch (error) {
        console.error("❌ Error in listProductVariants:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;

// Post /api/v1/admin/SaveProductVariant

// {
//     "_id": null, //for edit
//     "ProductId": "671100c6b94b6a56ef999111",
//     "Color": "Red",
//     "Size": "Large",
//     "PictureGallery": [
//         "https://cdn.theatercrave.com/products/red-variant1.jpg",
//         "https://cdn.theatercrave.com/products/red-variant2.jpg"
//     ],
//     "VideoGallery": [
//         "https://cdn.theatercrave.com/videos/red-variant.mp4"
//     ],
//     "IsActive": true
// }

// Post /api/v1/admin/listProductVariants

// Post /api/v1/admin/deleteProductVariant

// {
//     "ProductVariantId":"671100c6b94b6a56ef999111"
// }
