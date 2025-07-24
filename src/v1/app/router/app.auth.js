const express = require("express");
const router = express.Router();

const AssetMaster = require("../../../models/AssetMaster");
const {
  __requestResponse,
  __generateAuthToken,
} = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __SERVICE_NOTAVAILABLE,
} = require("../../../utils/variable");

// 🔐 Vendor Login API
router.post("/vendorLogin", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!/^\d{10}$/.test(phone)) {
      return res.json(__requestResponse("400", "Phone number must be 10 digits"));
    }

    if (!phone || !password) {
      return res.json(
        __requestResponse("400", "Phone and password are required")
      );
    }

    // Default password check
    if (password !== "1234") {
      return res.json(__requestResponse("401", "Invalid password"));
    }

    // Search by phone
    const asset = await AssetMaster.findOne({ Phone: phone, IsActive: true })
      .populate("CityId", "lookup_value")
      .populate("DestinationId", "Destination")
      .populate("LegalEntityTypeId", "lookup_value")
      .populate("Industry_Sector", "lookup_value")
      .populate("Industry_Sub_Sector", "lookup_value")
      .populate("CityIndicatorId", "CityIndicatorName")
      .populate("EstablishmentId", "lookup_value")
      .lean();

    if (!asset) {
      return res.json(__requestResponse("404", "Vendor not found"));
    }

    const token = __generateAuthToken({
      id: asset._id,
      type: "vendor",
      phone: asset.Phone,
    });

    return res.json(
      __requestResponse("200", __SUCCESS, {
        AssetId: asset._id,
        token,
        assetDetails: asset,
      })
    );
  } catch (error) {
    console.error("Vendor login error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;
