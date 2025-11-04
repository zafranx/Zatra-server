const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const ProductMaster = require("../../../models/NewProductMaster");
const NewProductVariantMaster = require("../../../models/NewProductVariantMaster");

// ✅ List Products with pagination + filters
router.post("/Products", async (req, res) => {
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
            ProductMaster.find(filter, "-createdAt -updatedAt -__v")
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

        const ProductsIds = __deepClone(data).map((item) => item?._id);

        const Variants = await NewProductVariantMaster.find(
            {
                ProductId: { $in: ProductsIds },
                IsActive: true,
            },
            "-createdAt -updatedAt -__v -IsActive"
        );

        return res.json(
            __requestResponse("200", __SUCCESS, {
                total,
                // page: parsedPage,
                // limit: parsedLimit,
                list: __deepClone(data)
                    .map((item) => {
                        const productVariants = __deepClone(Variants).filter(
                            (p_var) => p_var?.ProductId == item?._id
                        );
                        return { ...item, Variants: productVariants };
                    })
                    .filter((item) => item?.Variants.length != 0),
            })
        );
    } catch (error) {
        console.error("❌ Error in listProducts:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
