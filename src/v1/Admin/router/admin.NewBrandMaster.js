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
const BrandMaster = require("../../../models/NewBrandMaster");

// ✅ Add / Edit Brand
router.post("/SaveBrand", async (req, res) => {
    try {
        const { _id, AssetId, BrandName, Logo, PictureGallery, Wordmark } =
            req.body;

        const saveData = {
            AssetId: AssetId ? mongoose.Types.ObjectId(AssetId) : null,
            BrandName,
            Logo,
            PictureGallery,
            Wordmark,
        };

        if (!_id) {
            // ➕ Add new brand
            const newRec = await BrandMaster.create(saveData);

            await __CreateAuditLog(
                "n_brand_master",
                "Brand.Add",
                null,
                null,
                saveData,
                newRec._id
            );

            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            // ✏️ Edit brand
            const oldRec = await BrandMaster.findById(_id);
            if (!oldRec)
                return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

            await BrandMaster.updateOne({ _id }, { $set: saveData });

            await __CreateAuditLog(
                "n_brand_master",
                "Brand.Edit",
                null,
                oldRec,
                saveData,
                _id
            );

            return res.json(__requestResponse("200", __SUCCESS, saveData));
        }
    } catch (error) {
        console.error("❌ Error in SaveBrand:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// ✅ List Brands (with pagination and search)
router.post("/listBrands", async (req, res) => {
    try {
        const { AssetId, search, page = 1, limit = 10 } = req.body;

        const parsedPage = Math.max(parseInt(page) || 1, 1);
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (search) {
            filter.BrandName = { $regex: search, $options: "i" };
        }
        if (AssetId) filter.AssetId = AssetId;

        const [data, total] = await Promise.all([
            BrandMaster.find(filter)
                .populate("AssetId", "AssetName")
                .sort({ createdAt: -1 })
                // .skip(skip)
                // .limit(parsedLimit)
                .lean(),

            BrandMaster.countDocuments(filter),
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
        console.error("❌ Error in listBrands:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// ✅ Delete Brand
router.post("/deleteBrand", async (req, res) => {
    try {
        const { BrandId } = req.body;

        const record = await BrandMaster.findById(BrandId);
        if (!record)
            return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        await BrandMaster.deleteOne({ _id: BrandId });

        await __CreateAuditLog(
            "n_brand_master",
            "Brand.Delete",
            null,
            record,
            null,
            BrandId
        );

        return res.json(__requestResponse("200", __SUCCESS, {}));
    } catch (error) {
        console.error("❌ Error in deleteBrand:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
