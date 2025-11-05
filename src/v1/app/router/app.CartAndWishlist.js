const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const ProductVariant = require("../../../models/NewProductVariantMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const CartWishlist = require("../../../models/NewCartAndWishlist");

router.post("/AddCartWishlist", async (req, res) => {
    try {
        let { Type, UserId, ProductVariantIds = [] } = req.body;

        let rec = await CartWishlist.findOne({
            Type,
            // UserId
        });

        if (!rec) {
            rec = await CartWishlist.create({
                Type,
                // UserId,
                ProductVariantIds,
            });
        } else {
            ProductVariantIds.forEach((id) => {
                if (!rec.ProductVariantIds.includes(id)) {
                    rec.ProductVariantIds.push(id);
                }
            });
            await rec.save();
        }

        return res.json(__requestResponse("200", `${Type} Updated`, rec));
    } catch (error) {
        console.error("❌ Error in AddCartWishlist:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/GetCartWishlist", async (req, res) => {
    try {
        const { UserId, Type } = req.body;

        const rec = await CartWishlist.findOne({
            // UserId,
            Type,
        })
            .populate({
                path: "ProductVariantIds",
                populate: [{ path: "ProductId" }],
            })
            .lean();
        if (!rec) return res.json(__requestResponse("400", "Record not found"));

        const clone = __deepClone(rec)?.ProductVariantIds;

        return res.json(
            __requestResponse(
                "200",
                __SUCCESS,
                clone.map((item) => {
                    return {
                        ...item?.ProductId,
                        Variants: [
                            {
                                _id: item._id,
                                ProductId: item.ProductId?._id,
                                Color: item.Color,
                                Size: item.Size,
                                PictureGallery: item.PictureGallery,
                                VideoGallery: item.VideoGallery,
                                VariantSKU: item.VariantSKU,
                            },
                        ],
                    };
                })
            )
        );
    } catch (error) {
        console.error("❌ Error in GetCartWishlist:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/RemoveCartWishlistItem", async (req, res) => {
    try {
        const {
            // UserId,
            Type,
            ProductVariantId,
        } = req.body;

        const rec = await CartWishlist.findOne({
            // UserId,
            Type,
        });
        if (!rec) return res.json(__requestResponse("400", "Record not found"));

        rec.ProductVariantIds = rec.ProductVariantIds.filter(
            (id) => id.toString() !== ProductVariantId.toString()
        );

        await rec.save();

        return res.json(__requestResponse("200", `${Type} Item Removed`));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/ClearCartWishlist", async (req, res) => {
    try {
        const { UserId, Type } = req.body;

        await CartWishlist.findOneAndDelete({ UserId, Type });

        return res.json(__requestResponse("200", `${Type} Cleared`));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
