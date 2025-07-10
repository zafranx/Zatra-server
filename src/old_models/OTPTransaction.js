const mongoose = require("mongoose");
const { __randomNumber } = require("../utils/constent");

const _OTPTransaction = new mongoose.Schema(
    {
        OTP: { type: String },
        AssetId: { type: mongoose.SchemaTypes.ObjectId },
        IsUsed: { type: Boolean, default: false },
        IsExpired: { type: Boolean, default: false },
        RefLogin: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("otp_transaction", _OTPTransaction);
