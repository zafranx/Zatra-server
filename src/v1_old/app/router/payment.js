const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");

const {
    __SUCCESS,
    __SOME_ERROR,
    __DATA_404,
} = require("../../../utils/variable");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __fetchToken } = require("../middleware/authentication");

const { GetENV, NewPaymentOrder } = require("../constant");
var crypto = require("crypto");

router.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature === razorpay_signature) {
            res.send("Payment verified successfully");
        } else {
            res.status(400).send("Payment verification failed");
        }
    } catch (error) {
        console.log("error", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
