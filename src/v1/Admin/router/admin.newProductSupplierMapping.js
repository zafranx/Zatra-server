const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { __requestResponse, __deepClone } = require("../../../utils/constent");

const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");

const { __CreateAuditLog } = require("../../../utils/auditlog");
const ProductSupplierMapping = require("../../../models/NewProductSupplierMapping");

// 🔹 Add / Edit Product Supplier Mapping
router.post("/SaveProductSupplierMapping", async (req, res) => {
    try {
        const {
            _id,
            StationId,
            ProductId,
            ProductVariantId,
            AssetId,
            IsActive = true,
        } = req.body;

        const saveData = {
            StationId: mongoose.Types.ObjectId(StationId),
            ProductId: mongoose.Types.ObjectId(ProductId),
            ProductVariantId: mongoose.Types.ObjectId(ProductVariantId),
            AssetId: mongoose.Types.ObjectId(AssetId),
            IsActive,
        };

        if (!_id) {
            // ➕ Add New
            const newRec = await ProductSupplierMapping.create(saveData);
            await __CreateAuditLog(
                "n_product_supplier_mapping",
                "ProductSupplierMapping.Add",
                null,
                null,
                saveData,
                newRec._id
            );

            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            // ✏️ Edit Existing
            const oldRec = await ProductSupplierMapping.findById(_id);
            if (!oldRec)
                return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

            await ProductSupplierMapping.updateOne({ _id }, { $set: saveData });

            await __CreateAuditLog(
                "n_product_supplier_mapping",
                "ProductSupplierMapping.Edit",
                null,
                oldRec,
                saveData,
                _id
            );

            return res.json(__requestResponse("200", __SUCCESS, saveData));
        }
    } catch (error) {
        console.error("❌ Error in SaveProductSupplierMapping:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// 🔹 List Product Supplier Mappings (with pagination + filters)
router.post("/listProductSupplierMapping", async (req, res) => {
    try {
        const {
            StationId,
            ProductId,
            ProductVariantId,
            AssetId,
            page = 1,
            limit = 10,
        } = req.body;

        const parsedPage = Math.max(parseInt(page) || 1, 1);
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (StationId) filter.StationId = mongoose.Types.ObjectId(StationId);
        if (ProductId) filter.ProductId = mongoose.Types.ObjectId(ProductId);
        if (ProductVariantId)
            filter.ProductVariantId = mongoose.Types.ObjectId(ProductVariantId);
        if (AssetId) filter.AssetId = mongoose.Types.ObjectId(AssetId);

        const [data, total] = await Promise.all([
            ProductSupplierMapping.find(filter)
                .populate("StationId", "lookup_value")
                .populate("ProductId", "ProductName")
                .populate("ProductVariantId", "VariantSKU Color Size")
                .populate("AssetId", "AssetName Manufacturer")
                .sort({ createdAt: -1 })
                // .skip(skip)
                // .limit(parsedLimit)
                .lean(),
            ProductSupplierMapping.countDocuments(filter),
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
        console.error("❌ Error in listProductSupplierMapping:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// 🔹 Delete Product Supplier Mapping
router.post("/deleteProductSupplierMapping", async (req, res) => {
    try {
        const { ProductSupplierMappingId } = req.body;

        const record = await ProductSupplierMapping.findByIdAndDelete(
            ProductSupplierMappingId
        );
        if (!record)
            return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        await __CreateAuditLog(
            "n_product_supplier_mapping",
            "ProductSupplierMapping.Delete",
            null,
            record,
            null,
            ProductSupplierMappingId
        );

        return res.json(__requestResponse("200", __SUCCESS, {}));
    } catch (error) {
        console.error("❌ Error in deleteProductSupplierMapping:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;

// Post /api/v1/admin/SaveProductSupplierMapping

// {
//     "_id": null, //for edit
//     "StationId": "671100c6b94b6a56ef999111",
//     "ProductId": "671100c6b94b6a56ef999111",
//     "ProductVariantId": "671100c6b94b6a56ef999111",
//     "AssetId": "671100c6b94b6a56ef999111",
//     "IsActive": true
// }

// Post /api/v1/admin/listProductSupplierMapping

// Post /api/v1/admin/deleteProductSupplierMapping

// {
//     "ProductSupplierMappingId":"671100c6b94b6a56ef999111"
// }
