const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
    __VALIDATION_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { AssetMaster } = require("../../../models/AssetMaster");
const { ExhibitorMaster } = require("../../../models/ExhibitorMaster");

router.post("/CreateExhibitor", async (req, res) => {
    try {
        const {
            ExhibitorID,
            EventID,
            ExhibitorName,
            ExhibitorTypeID,
            Website,
            EmailAddress,
            AddressID,
            CityID,
            AssetID,
        } = req.body;

        const assetData = {
            EventID,
            ExhibitorName,
            ExhibitorTypeID,
            Website,
            EmailAddress,
            AddressID,
            CityID,
            AssetID,
        };

        if (!ExhibitorID) {
            // Add new asset
            const newRec = await ExhibitorMaster.create(assetData);

            await __CreateAuditLog(
                "exhibitor_masters",
                "ExhibitorMaster.Add",
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
            const oldRec = await ExhibitorMaster.findById(ExhibitorID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await ExhibitorMaster.updateOne(
                { _id: ExhibitorID },
                { $set: assetData }
            );

            await __CreateAuditLog(
                "exhibitor_masters",
                "ExhibitorMaster.Edit",
                null,
                oldRec,
                assetData,
                ExhibitorID,
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

router.post("/ListExhibitor", async (req, res) => {
    try {
        const list = await ExhibitorMaster.find({}).populate([
            {
                path: "EventID AssetID",
                select: "AssetName EventName",
            },
            {
                path: "ExhibitorTypeID CityID",
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

        return res.json(
            __requestResponse(
                "200",
                __SUCCESS,
                __deepClone(list).map((item) => {
                    return {
                        ...item,
                        AddressID: item.AddressID
                            ? {
                                  _id: item.AddressID._id,
                                  lookup_value:
                                      item.AddressID.AddressTypeId
                                          ?.lookup_value,
                                  line1: item.AddressID.AddressLine1,
                                  line2: item.AddressID.AddressLine2,
                                  pin: item.AddressID.PIN,
                                  full_address: `${item?.AddressID.AddressLine1}, ${item?.AddressID.AddressLine2}, ${item?.AddressID.PIN}`,
                              }
                            : null,
                    };
                })
            )
        );
    } catch (error) {
        console.log("ListAssets Error:", error.message);
        return res.json(__requestResponse("500", __SOME_ERROR));
    }
});

// Add or Edit Product Category for an Asset
router.post("/SaveExhibitorProductCategory", async (req, res) => {
    try {
        const { ExhibitorID, categoryId, categoryName } = req.body;

        if (!categoryName) {
            return res.json(
                __requestResponse("400", "Category name is required")
            );
        }

        let result;

        if (categoryId) {
            // Edit existing category
            result = await ExhibitorMaster.updateOne(
                { "ProductCategories._id": categoryId },
                { $set: { "ProductCategories.$.CategoryName": categoryName } }
            );
        } else {
            // Add new category to specific asset
            if (!ExhibitorID) {
                return res.json(
                    __requestResponse("400", "Asset ID is required")
                );
            }
            result = await ExhibitorMaster.findByIdAndUpdate(
                ExhibitorID,
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
router.post("/ListExhibitorProductCategories", async (req, res) => {
    try {
        const { ExhibitorID } = req.body;

        if (!mongoose.Types.ObjectId.isValid(ExhibitorID)) {
            return res.json(__requestResponse("400", "Invalid Asset ID"));
        }

        const asset = await ExhibitorMaster.findById(
            ExhibitorID,
            "ProductCategories"
        );

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
router.post("/SaveExhibitorProductSubCategory", async (req, res) => {
    try {
        const { ExhibitorID, subCategoryId, categoryId, subCategoryName } =
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
            result = await ExhibitorMaster.updateOne(
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
            if (!ExhibitorID) {
                return res.json(
                    __requestResponse("400", "Asset ID is required")
                );
            }

            result = await ExhibitorMaster.findByIdAndUpdate(
                ExhibitorID,
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

router.post("/ListExhibitorProductSubCategories", async (req, res) => {
    try {
        const { ExhibitorID } = req.body;

        if (!mongoose.Types.ObjectId.isValid(ExhibitorID)) {
            return res.json(__requestResponse("400", "Invalid Asset ID"));
        }

        // Fetch both categories and subcategories
        const asset = await ExhibitorMaster.findById(
            ExhibitorID,
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

// router.post("/DeleteProductCategory", async (req, res) => {
//     try {
//         const { assetId, categoryId } = req.body;

//         if (!assetId || !categoryId) {
//             return res.json(
//                 __requestResponse(
//                     "400",
//                     "Asset ID and Category ID are required"
//                 )
//             );
//         }

//         const result = await AssetMaster.updateOne(
//             { _id: assetId },
//             { $pull: { ProductCategories: { _id: categoryId } } }
//         );

//         if (result.modifiedCount === 0) {
//             return res.json(__requestResponse("404", "Category not found"));
//         }

//         return res.json(__requestResponse("200", __SUCCESS, {}));
//     } catch (error) {
//         return res.json(__requestResponse("500", __SOME_ERROR, error.message));
//     }
// });

module.exports = router;
