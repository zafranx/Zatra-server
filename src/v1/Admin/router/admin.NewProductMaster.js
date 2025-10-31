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
const ProductMaster = require("../../../models/NewProductMaster");

// ✅ Add / Edit Product
router.post("/SaveProduct", async (req, res) => {
    try {
        const {
            _id,
            ProductName,
            ShortDescription,
            LongDescription,
            PanchtatvaCategoryLevel1_Id,
            PanchtatvaCategoryLevel2_Id,
            PanchtatvaCategoryLevel3_Id,
            Stations,
            AssetId,
            BrandId,
            MrpWithCurrency,
            DiscountWithCurrency,
            IsActive = true,
        } = req.body;

        const saveData = {
            ProductName,
            ShortDescription,
            LongDescription,
            PanchtatvaCategoryLevel1_Id: PanchtatvaCategoryLevel1_Id
                ? mongoose.Types.ObjectId(PanchtatvaCategoryLevel1_Id)
                : null,
            PanchtatvaCategoryLevel2_Id: PanchtatvaCategoryLevel2_Id
                ? mongoose.Types.ObjectId(PanchtatvaCategoryLevel2_Id)
                : null,
            PanchtatvaCategoryLevel3_Id: PanchtatvaCategoryLevel3_Id
                ? mongoose.Types.ObjectId(PanchtatvaCategoryLevel3_Id)
                : null,
            Stations:
                Stations?.map((s) => ({
                    StationsId: s.StationsId
                        ? mongoose.Types.ObjectId(s.StationsId)
                        : null,
                    StationsSpecialityId: s.StationsSpecialityId
                        ? mongoose.Types.ObjectId(s.StationsSpecialityId)
                        : null,
                })) || [],
            AssetId: AssetId ? mongoose.Types.ObjectId(AssetId) : null,
            BrandId: BrandId ? mongoose.Types.ObjectId(BrandId) : null,
            MrpWithCurrency:
                MrpWithCurrency?.map((m) => ({
                    Currency: m.Currency
                        ? mongoose.Types.ObjectId(m.Currency)
                        : null,
                    MRP: m.MRP || 0,
                })) || [],
            DiscountWithCurrency:
                DiscountWithCurrency?.map((d) => ({
                    Currency: d.Currency
                        ? mongoose.Types.ObjectId(d.Currency)
                        : null,
                    Discount: d.Discount || 0,
                })) || [],
            IsActive,
        };

        // ADD
        if (!_id) {
            const newRec = await ProductMaster.create(saveData);
            await __CreateAuditLog(
                "n_product_master",
                "Product.Add",
                null,
                null,
                saveData,
                newRec._id
            );
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        }

        // EDIT
        const oldRec = await ProductMaster.findById(_id);
        if (!oldRec)
            return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        await ProductMaster.updateOne({ _id }, { $set: saveData });
        await __CreateAuditLog(
            "n_product_master",
            "Product.Edit",
            null,
            oldRec,
            saveData,
            _id
        );
        return res.json(__requestResponse("200", __SUCCESS, saveData));
    } catch (error) {
        console.error("❌ Error in SaveProduct:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// ✅ List Products with pagination + filters
router.post("/listProducts", async (req, res) => {
    try {
        const {
            PanchtatvaCategoryLevel1_Id,
            PanchtatvaCategoryLevel2_Id,
            PanchtatvaCategoryLevel3_Id,
            BrandId,
            search,
            IsActive,
            page = 1,
            limit = 10,
        } = req.body;

        const parsedPage = Math.max(parseInt(page) || 1, 1);
        const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
        const skip = (parsedPage - 1) * parsedLimit;

        const filter = {};

        if (PanchtatvaCategoryLevel1_Id)
            filter.PanchtatvaCategoryLevel1_Id = PanchtatvaCategoryLevel1_Id;
        if (PanchtatvaCategoryLevel2_Id)
            filter.PanchtatvaCategoryLevel2_Id = PanchtatvaCategoryLevel2_Id;
        if (PanchtatvaCategoryLevel3_Id)
            filter.PanchtatvaCategoryLevel3_Id = PanchtatvaCategoryLevel3_Id;
        if (BrandId) filter.BrandId = BrandId;
        if (typeof IsActive === "boolean") filter.IsActive = IsActive;
        if (search) {
            filter.ProductName = { $regex: search, $options: "i" };
        }

        const [data, total] = await Promise.all([
            ProductMaster.find(filter)
                .populate("PanchtatvaCategoryLevel1_Id", "lookup_value")
                .populate("PanchtatvaCategoryLevel2_Id", "lookup_value")
                .populate("PanchtatvaCategoryLevel3_Id", "lookup_value")
                .populate("Stations.StationsId", "lookup_value")
                .populate("Stations.StationsSpecialityId", "lookup_value")
                .populate("AssetId", "AssetName")
                .populate("BrandId", "BrandName")
                .populate("MrpWithCurrency.Currency", "lookup_value")
                .populate("DiscountWithCurrency.Currency", "lookup_value")
                .sort({ createdAt: -1 })
                // .skip(skip)
                // .limit(parsedLimit)
                .lean(),
            ProductMaster.countDocuments(filter),
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
        console.error("❌ Error in listProducts:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// ✅ Delete Product
router.post("/deleteProduct", async (req, res) => {
    try {
        const { ProductId } = req.body;

        if (!ProductId)
            return res.json(__requestResponse("400", "Product ID required"));

        const oldRec = await ProductMaster.findByIdAndDelete(ProductId);
        if (!oldRec)
            return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        await __CreateAuditLog(
            "n_product_master",
            "Product.Delete",
            null,
            oldRec,
            null,
            ProductId
        );

        return res.json(
            __requestResponse("200", __SUCCESS, "Product deleted successfully")
        );
    } catch (error) {
        console.error("❌ Error in deleteProduct:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
