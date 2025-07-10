const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
// const AssetMaster = require("../../../models/AssetMaster");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
    __VALIDATION_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { AssetMaster } = require("../../../models/AssetMaster");

router.post("/CreateAssets_old", async (req, res) => {
    try {
        const {
            AssetId,
            AssetCategoryID,
            AssetSubCategoryID,
            SubCategoryTypeID,
            AssetName,
            CityID,
            CityGroupID,
            AddressID,
            ShortDesc,
            LongDesc,
            CurrentMRP,
            PictureGalleryID,
            VideoGalleryID,
        } = req.body;

        const data = {
            AssetCategoryID,
            AssetSubCategoryID,
            SubCategoryTypeID,
            AssetName,
            CityID,
            CityGroupID,
            AddressID,
            ShortDesc,
            LongDesc,
            CurrentMRP,
            PictureGalleryID,
            VideoGalleryID,
        };
        console.log(data, "data");
        if (!AssetId) {
            console.log("data1");

            const responce = await AssetMaster.create({
                ...data,
            });
            console.log(responce);
        } else {
            console.log("data2");

            await AssetMaster.findByIdAndUpdate(AssetId, {
                ...data,
            });
        }

        return res.json(__requestResponse("200", __SUCCESS, {}));
    } catch (error) {
        console.log(error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

router.post("/CreateAssets", async (req, res) => {
    try {
        const {
            AssetId,
            AssetCategoryID,
            AssetSubCategoryID,
            SubCategoryTypeID,
            AssetName,
            CityID,
            AddressID,
            ShortDesc,
            LongDesc,
            CurrentMRP,
            PictureGalleryID,
            VideoGalleryID,
        } = req.body;

        const CityGroupID = req.body.CityGroupID
            ? req.body.CityGroupID.map((id) => mongoose.Types.ObjectId(id))
            : [];

        const assetData = {
            AssetCategoryID,
            AssetSubCategoryID,
            SubCategoryTypeID,
            AssetName,
            CityID,
            CityGroupID,
            AddressID,
            ShortDesc,
            LongDesc,
            CurrentMRP,
            PictureGalleryID,
            VideoGalleryID,
        };

        if (!AssetId) {
            // Add new asset
            const newRec = await AssetMaster.create(assetData);

            await __CreateAuditLog(
                "asset_master",
                "Asset.Add",
                null,
                null,
                assetData,
                newRec._id,
                null,
                null
            );

            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            // Edit existing asset
            const oldRec = await AssetMaster.findById(AssetId);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await AssetMaster.updateOne({ _id: AssetId }, { $set: assetData });

            await __CreateAuditLog(
                "asset_master",
                "Asset.Edit",
                null,
                oldRec,
                assetData,
                AssetId,
                null,
                null
            );

            return res.json(__requestResponse("200", __SUCCESS, "data saved"));
        }
    } catch (error) {
        console.log("CreateAssets Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

router.post("/ListAssets", async (req, res) => {
    try {
        const list = await AssetMaster.find({}).populate([
            {
                path: "AssetCategoryID AssetSubCategoryID SubCategoryTypeID CityID CityGroupID",
                select: "lookup_value",
            },
            {
                path: "AddressID",
                select: "AddressLine1 AddressLine2 PIN AddressTypeId",
                populate: {
                    path: "AddressTypeId",
                    select: "lookup_value",
                },
            },
        ]);
        const finalList = list.map((item) => {
            const categoryMap = new Map();
            item.ProductCategories?.forEach((cat) =>
                categoryMap.set(cat._id.toString(), cat.CategoryName)
            );

            const subCategoriesWithNames = item.ProductSubCategories?.map(
                (sub) => ({
                    _id: sub._id,
                    CategoryID: sub.CategoryID,
                    CategoryName:
                        categoryMap.get(sub.CategoryID?.toString()) || null,
                    SubCategoryName: sub.SubCategoryName,
                })
            );

            return {
                _id: item._id,
                AssetName: item.AssetName,
                AssetCategory: item.AssetCategoryID || null,
                AssetSubCategory: item.AssetSubCategoryID || null,
                SubCategoryType: item.SubCategoryTypeID || null,
                City: item.CityID || null,
                CityGroup: item.CityGroupID || null,
                Address: item.AddressID
                    ? {
                          _id: item.AddressID._id,
                          lookup_value:
                              item.AddressID.AddressTypeId?.lookup_value,
                          line1: item.AddressID.AddressLine1,
                          line2: item.AddressID.AddressLine2,
                          pin: item.AddressID.PIN,
                          full_address: `${item?.AddressID.AddressLine1}, ${item?.AddressID.AddressLine2}, ${item?.AddressID.PIN}`,
                      }
                    : null,
                ShortDesc: item.ShortDesc,
                LongDesc: item.LongDesc,
                CurrentMRP: item.CurrentMRP,
                ProductCategories: item.ProductCategories || [],
                ProductSubCategories: subCategoriesWithNames,
            };
        });
        // console.log(finalList, "final");
        return res.json(__requestResponse("200", __SUCCESS, finalList));
    } catch (error) {
        console.log("ListAssets Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// Add or Edit Product Category for an Asset
router.post("/SaveProductCategory", async (req, res) => {
    try {
        const { assetId, categoryId, categoryName } = req.body;

        if (!categoryName) {
            return res.json(
                __requestResponse("400", "Category name is required")
            );
        }

        let result;

        if (categoryId) {
            // Edit existing category
            result = await AssetMaster.updateOne(
                { "ProductCategories._id": categoryId },
                { $set: { "ProductCategories.$.CategoryName": categoryName } }
            );
        } else {
            // Add new category to specific asset
            if (!assetId) {
                return res.json(
                    __requestResponse("400", "Asset ID is required")
                );
            }
            result = await AssetMaster.findByIdAndUpdate(
                assetId,
                {
                    $push: {
                        ProductCategories: { CategoryName: categoryName },
                    },
                },
                { new: true }
            );
        }

        return res.json(__requestResponse("200", __SUCCESS, result));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});
router.post("/ListProductCategories", async (req, res) => {
    try {
        const { assetId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(assetId)) {
            return res.json(__requestResponse("400", "Invalid Asset ID"));
        }

        const asset = await AssetMaster.findById(assetId, "ProductCategories");

        if (!asset) {
            return res.json(__requestResponse("404", "Asset not found"));
        }

        return res.json(
            __requestResponse("200", __SUCCESS, asset.ProductCategories)
        );
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

// Add or Edit Product SubCategory
router.post("/SaveProductSubCategory", async (req, res) => {
    try {
        const { assetId, subCategoryId, categoryId, subCategoryName } =
            req.body;

        if (!categoryId || !subCategoryName) {
            return res.json(
                __requestResponse(
                    "400",
                    "Category ID and SubCategory name are required"
                )
            );
        }

        let result;

        if (subCategoryId) {
            // Edit existing subcategory
            result = await AssetMaster.updateOne(
                { "ProductSubCategories._id": subCategoryId },
                {
                    $set: {
                        "ProductSubCategories.$.CategoryID": categoryId,
                        "ProductSubCategories.$.SubCategoryName":
                            subCategoryName,
                    },
                }
            );
        } else {
            // Add new subcategory to asset
            if (!assetId) {
                return res.json(
                    __requestResponse("400", "Asset ID is required")
                );
            }

            result = await AssetMaster.findByIdAndUpdate(
                assetId,
                {
                    $push: {
                        ProductSubCategories: {
                            CategoryID: categoryId,
                            SubCategoryName: subCategoryName,
                        },
                    },
                },
                { new: true }
            );
        }

        return res.json(__requestResponse("200", __SUCCESS, result));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

router.post("/ListProductSubCategories", async (req, res) => {
    try {
        const { assetId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(assetId)) {
            return res.json(__requestResponse("400", "Invalid Asset ID"));
        }

        // Fetch both categories and subcategories
        const asset = await AssetMaster.findById(
            assetId,
            "ProductCategories ProductSubCategories"
        );

        if (!asset) {
            return res.json(__requestResponse("404", "Asset not found"));
        }

        const categoryMap = new Map();
        asset.ProductCategories.forEach((cat) =>
            categoryMap.set(cat._id.toString(), cat.CategoryName)
        );

        const subCategoriesWithNames = asset.ProductSubCategories.map(
            (sub) => ({
                _id: sub._id,
                CategoryID: sub.CategoryID,
                CategoryName:
                    categoryMap.get(sub.CategoryID?.toString()) || null,
                SubCategoryName: sub.SubCategoryName,
            })
        );

        return res.json(
            __requestResponse("200", __SUCCESS, subCategoriesWithNames)
        );
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

// router.get("/ListProductSubCategories/:assetId", async (req, res) => {
//   try {
//     const { assetId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(assetId)) {
//       return res.json(__requestResponse("400", "Invalid Asset ID"));
//     }

//     const asset = await AssetMaster.findById(
//       assetId,
//       "ProductSubCategories"
//     ).populate("ProductSubCategories.CategoryID", "lookup_value");

//     if (!asset) {
//       return res.json(__requestResponse("404", "Asset not found"));
//     }

//     return res.json(
//       __requestResponse("200", __SUCCESS, asset.ProductSubCategories)
//     );
//   } catch (error) {
//     return res.json(__requestResponse("500", __SOME_ERROR, error.message));
//   }
// });

router.post("/DeleteProductCategory", async (req, res) => {
    try {
        const { assetId, categoryId } = req.body;

        if (!assetId || !categoryId) {
            return res.json(
                __requestResponse(
                    "400",
                    "Asset ID and Category ID are required"
                )
            );
        }

        const result = await AssetMaster.updateOne(
            { _id: assetId },
            { $pull: { ProductCategories: { _id: categoryId } } }
        );

        if (result.modifiedCount === 0) {
            return res.json(__requestResponse("404", "Category not found"));
        }

        return res.json(__requestResponse("200", __SUCCESS, {}));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;
