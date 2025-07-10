const mongoose = require("mongoose");

const _lookupschema = new mongoose.Schema(
    {
        FirstName: {
            type: String,
        },
        LastName: {
            type: String,
        },
        Gender: {
            type: String,
        },
        MobileNo: {
            type: String,
        },
        DOB: { type: Date },
        EmailAddress: {
            type: String,
        },
        OTP: {
            type: String,
        },
        IsOTPVerified: {
            type: Boolean,
            default: false,
        },
        NatioalityID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        PostalCode: {
            type: String,
        },
        BloodGroup: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        CountryCode: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        PledgeForBlood: {
            type: Boolean,
            default: false,
        },
        PledgeForOrgan: {
            type: Boolean,
            default: false,
        },
        InsurancePartners: [{ type: mongoose.SchemaTypes.ObjectId }],
        PreExistingDisease: [{ type: mongoose.SchemaTypes.ObjectId }],
        AssetID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_masters",
        },
        Pwd: {
            type: String,
        },
        IsFirstTime: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("signup", _lookupschema);
