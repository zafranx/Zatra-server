const express = require("express");
const router = express.Router();

const AssetMaster = require("../../../models/AssetMaster");
const {
  validateSaveAssetMaster,
} = require("../Middleware/assetMaster.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { default: mongoose } = require("mongoose");
const ProductMaster = require("../../../models/ProductMaster");
const { createAssetLogin } = require("../../../utils/authHelper");

// Save AssetMaster (Add / Edit) - Asset Master
router.post("/SaveAsset", validateSaveAssetMaster, async (req, res) => {
  try {
    const {
      //   _id,
      _id: rawId,
      AssetType,
      CityId,
      DestinationId,
      LegalEntityTypeId,
      Name, // Asset Name
      Registration_Number,
      GST,
      PAN,
      Registration_Address,
      Authorised_Representative,
      Phone,
      EmailAddress,
      Website,
      LinkedIn,
      Instagram,
      Facebook,
      Industry_Sector,
      Industry_Sub_Sector,
      Logo,
      IsVerified,
      VerifiedBy,
      VerificationDate,
      VerificationReport,
      CityIndicatorId,
      EstablishmentId,
      AllocationNumber,
      Lane,
      Hall,
      Floor,
      Address,
      Geolocation,
      IsAccountLogin,
      Password, // for asset user login
      IsActive,
    } = req.body;
    let _id = null;
    if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
      _id = mongoose.Types.ObjectId(rawId);
    }

    const saveData = {
      AssetType,
      CityId,
      DestinationId,
      LegalEntityTypeId,
      Name,
      Registration_Number,
      GST,
      PAN,
      Registration_Address,
      Authorised_Representative,
      Phone,
      EmailAddress,
      Website,
      LinkedIn,
      Instagram,
      Facebook,
      Industry_Sector,
      Industry_Sub_Sector,
      Logo,
      IsVerified,
      VerifiedBy,
      VerificationDate,
      VerificationReport,
      CityIndicatorId,
      EstablishmentId,
      AllocationNumber,
      Lane,
      Hall,
      Floor,
      Address,
      Geolocation,
      IsAccountLogin,
      IsActive,
    };

    if (!_id || _id === "" || _id === null) {
      const newRec = await AssetMaster.create(saveData);
      await __CreateAuditLog(
        "asset_master",
        "AssetMaster.Add",
        null,
        null,
        saveData,
        newRec._id
      );

      // create login of asset in asset user
      if (IsAccountLogin) {
        try {
          const loginResult = await createAssetLogin({
            assetId: newRec._id,
            Name: Name,
            Phone: Phone,
            Password: Password,
          });
          console.log("Login Created with password:", loginResult.Password);

          // Send Email
          //     await sendLoginEmail(
          //       data.Email,
          //       "Your Credentials",
          //       `<h3>Hello ${data.AssetName},</h3>
          //   <p>Your login ID is: <strong>${data.MobileNo}</strong></p>
          //   <p>Your password is: <strong>${loginResult.plainPassword}</strong></p>
          //   <p>Please change your password after login.</p>`
          //     );
        } catch (err) {
          console.error("Login creation failed:", err.message);
          // console.error("Login credentials sending failed:", err.message);
        }
      }

      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await AssetMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await AssetMaster.updateOne({ _id }, { $set: saveData });
      await __CreateAuditLog(
        "asset_master",
        "AssetMaster.Edit",
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

// AssetList with Product Count New api
router.post("/AssetList", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      AssetId,
      LegalEntityTypeId,
      Industry_Sector,
      Industry_Sub_Sector,
      CityId,
      DestinationId,
      AssetType,
      EstablishmentId,
      CityIndicatorId,
    } = req.body;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);

    const filter = {};
    if (search) {
      filter.Name = { $regex: search, $options: "i" };
    }
    if (AssetId) filter._id = AssetId;
    if (LegalEntityTypeId) filter.LegalEntityTypeId = LegalEntityTypeId;
    if (Industry_Sector) filter.Industry_Sector = Industry_Sector;
    if (Industry_Sub_Sector) filter.Industry_Sub_Sector = Industry_Sub_Sector;
    if (CityId) filter.CityId = CityId;
    if (DestinationId) filter.DestinationId = DestinationId;
    if (AssetType) filter.AssetType = AssetType;
    if (EstablishmentId) filter.EstablishmentId = EstablishmentId;
    if (CityIndicatorId) filter.CityIndicatorId = CityIndicatorId;

    const total = await AssetMaster.countDocuments(filter);

    let list = await AssetMaster.find(filter)
      .populate("CityId", "lookup_value")
      .populate("DestinationId", "Destination")
      .populate("LegalEntityTypeId", "lookup_value")
      .populate("Industry_Sector", "lookup_value")
      .populate("Industry_Sub_Sector", "lookup_value")
      .populate("CityIndicatorId", "CityIndicatorName")
      .populate("EstablishmentId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .lean();
    
    // Add Product Count per Asset
    const assetIds = list.map((asset) => asset._id);

    const productCounts = await ProductMaster.aggregate([
      { $match: { AssetId: { $in: assetIds } } },
      {
        $group: {
          _id: "$AssetId",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = {};
    productCounts.forEach((item) => {
      countMap[item._id.toString()] = item.count;
    });

    list = list.map((asset) => ({
      ...asset,
      ProductCount: countMap[asset._id.toString()] || 0,
    }));

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
        total,
        page: pageInt,
        limit: limitInt,
      })
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", error, __SOME_ERROR));
  }
});

module.exports = router;
