const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const OrderMaster = require("../../../models/NewOrderMaster");
const ProductVariant = require("../../../models/NewProductVariantMaster");
// const Inventory = require("../../../models/n_inverntory_master");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const CartWishlist = require("../../../models/NewCartAndWishlist");

router.post("/Order/Save", async (req, res) => {
    try {
        const {
            Products,
            ShippingAddress,
            OrderValue,
            UserId = null,
        } = req.body;

        // if (!data?.UserId || !Products?.length)
        //     return res.json(__requestResponse("400", "Invalid payload"));

        // ✅ Create new order
        const newOrder = await OrderMaster.create({
            UserId,
            Products,
            ShippingAddress,
            OrderValue,
        });

        await CartWishlist.findOneAndDelete({
            // UserId,
            Type: "Cart",
        });

        return res.json(
            __requestResponse("200", "Order Placed Successfully", newOrder)
        );
    } catch (error) {
        console.error("❌ Error in Order Save:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
module.exports = router;
