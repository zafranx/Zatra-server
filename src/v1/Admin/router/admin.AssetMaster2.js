const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const AssetMaster = require("../../../models/AssetMaster2");
const {
  validateSaveAssetMaster2,
} = require("../Middleware/assetMaster2.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { createAssetLogin } = require("../../../utils/authHelper");
const ProductMaster = require("../../../models/ProductMaster");

// Save Asset (Add/Edit)
router.post("/AddEditAsset", validateSaveAssetMaster2, async (req, res) => {
  try {
    const { _id: rawId, IsAccountLogin, Password, ...saveData } = req.body;

    let _id = null;
    if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
      _id = mongoose.Types.ObjectId(rawId);
    }

    if (!_id) {
      // --- Add New Asset
      const newRec = await AssetMaster.create(saveData);

      await __CreateAuditLog(
        "asset_master2",
        "AssetMaster.Add",
        null,
        null,
        saveData,
        newRec._id
      );

      // --- Create login if needed
      if (IsAccountLogin) {
        try {
          await createAssetLogin({
            assetId: newRec._id,
            Name: newRec.LegalEntityName || newRec.DestinationName,
            Phone: newRec.Phone,
            Password: Password,
          });
        } catch (err) {
          console.error("Login creation failed:", err.message);
        }
      }

      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      // --- Edit Existing Asset
      const oldRec = await AssetMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await AssetMaster.updateOne({ _id }, { $set: saveData });

      await __CreateAuditLog(
        "asset_master2",
        "AssetMaster.Edit",
        null,
        oldRec,
        saveData,
        _id
      );

      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", error.message, __SOME_ERROR));
  }
});

//* -------------------------------------*
//  Save Asset (Add/Edit)
router.post("/SaveAsset3", validateSaveAssetMaster2, async (req, res) => {
  try {
    const {
      _id: rawId,
      StationId,
      AssetId,
      ParentAssetId,
      IsDestination,
      EstablishmentId,
      PanchtatvaCategoryId,
      IndustryId,
      DestinationName,
      LegalEntityTypeId,
      LegalEntityName,
      Registration_Number,
      GST,
      PAN,
      Registration_Address,
      IsVerified,
      VerificationReport,
      VerifiedBy,
      VerificationDate,
      AllocationNumber,
      Lane,
      Hall,
      Floor,
      AddressLine1,
      AddressLine2,
      PostalCode,
      Geolocation,
      ShortDescription,
      LongDescription,
      PictureGallery,
      VideoGallery,
      OpeningDays,
      OpeningTime,
      ClosingTime,
      DayBreakTime,
      BusinessHours,
      GeneralPublicHour,
      SocialMedia,
      MaxLimitOfVisitorsPerDay,
      TodayVisitorCount,
      TicketCharges,
      OnlineBookingURL,
      AuthorizedRepresentativeName,
      AuthorizedRepresentativePhoneNo,
      AuthorizedRepresentativeWhatsApp,
      AuthorizedRepresentativeEmail,
      OfficeAddress,
      OfficeGeoLocation,
      IsOpen,
      LiveFeedURL,
      AllocatedQRCode,
      IsAccountLogin,
      Password, // only if IsAccountLogin is true
      IsActive,
      CityIndicatorId,
      CityId,
      AssetType,
      Industry_Sector,
      Industry_Sub_Sector,
      Phone,
      EmailAddress,
      Website,
      LinkedIn,
      Instagram,
      Facebook,
      Logo,
      DestinationAmenities,
    } = req.body;

    let _id = null;
    if (rawId && mongoose.Types.ObjectId.isValid(rawId)) {
      _id = mongoose.Types.ObjectId(rawId);
    }

    const saveData = {
      StationId,
      AssetId,
      ParentAssetId,
      IsDestination,
      EstablishmentId,
      PanchtatvaCategoryId,
      IndustryId,
      DestinationName,
      LegalEntityTypeId,
      LegalEntityName,
      Registration_Number,
      GST,
      PAN,
      Registration_Address,
      IsVerified,
      VerificationReport,
      VerifiedBy,
      VerificationDate,
      AllocationNumber,
      Lane,
      Hall,
      Floor,
      AddressLine1,
      AddressLine2,
      PostalCode,
      Geolocation,
      ShortDescription,
      LongDescription,
      PictureGallery,
      VideoGallery,
      OpeningDays,
      OpeningTime,
      ClosingTime,
      DayBreakTime,
      BusinessHours,
      GeneralPublicHour,
      SocialMedia,
      MaxLimitOfVisitorsPerDay,
      TodayVisitorCount,
      TicketCharges,
      OnlineBookingURL,
      AuthorizedRepresentativeName,
      AuthorizedRepresentativePhoneNo,
      AuthorizedRepresentativeWhatsApp,
      AuthorizedRepresentativeEmail,
      OfficeAddress,
      OfficeGeoLocation,
      IsOpen,
      LiveFeedURL,
      AllocatedQRCode,
      IsAccountLogin,
      IsActive,
      CityIndicatorId,
      CityId,
      DestinationId,
      AssetType,
      Industry_Sector,
      Industry_Sub_Sector,
      Phone,
      EmailAddress,
      Website,
      LinkedIn,
      Instagram,
      Facebook,
      Logo,
      DestinationAmenities, // ✅ include in save
    };

    if (!_id) {
      // Add
      const newRec = await AssetMaster.create(saveData);

      await __CreateAuditLog(
        "asset_master2",
        "AssetMaster.Add",
        null,
        null,
        saveData,
        newRec._id
      );

      //  Create login in ZATRA_LOGIN if required
      if (IsAccountLogin) {
        try {
          const loginResult = await createAssetLogin({
            assetId: newRec._id,
            Name: DestinationName || LegalEntityName,
            Phone: AuthorizedRepresentativePhoneNo,
            Password,
          });
          console.log("Login Created for Asset Admin:", loginResult);
        } catch (err) {
          console.error("Login creation failed:", err.message);
        }
      }

      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      // Edit
      const oldRec = await AssetMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await AssetMaster.updateOne({ _id }, { $set: saveData });

      await __CreateAuditLog(
        "asset_master2",
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

//  Asset List API
router.post("/GetAssetList", async (req, res) => {
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
    if (search) filter.DestinationName = { $regex: search, $options: "i" };
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
      .populate("LegalEntityTypeId", "lookup_value")
      .populate("Industry_Sector", "lookup_value")
      .populate("Industry_Sub_Sector", "lookup_value")
      .populate("CityIndicatorId", "CityIndicatorName")
      .populate("EstablishmentId", "lookup_value")
      .populate("PanchtatvaCategoryId", "lookup_value")
      .populate("DestinationAmenities.AmenityId", "AmenityName")
      .sort({ createdAt: -1 })
      .skip((pageInt - 1) * limitInt)
      .limit(limitInt)
      .lean();

    // Add Product Count per Asset
    const assetIds = list.map((asset) => asset._id);
    const productCounts = await ProductMaster.aggregate([
      { $match: { AssetId: { $in: assetIds } } },
      { $group: { _id: "$AssetId", count: { $sum: 1 } } },
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

// Get Asset by ID
router.get("/GetAsset/:id", async (req, res) => {
  try {
    const data = await AssetMaster.findById(req.params.id)
      .populate("CityId", "lookup_value")
      .populate("DestinationId", "Destination")
      .populate("LegalEntityTypeId", "lookup_value")
      .populate("IndustryId", "lookup_value")
      .populate("PanchtatvaCategoryId", "lookup_value")
      .populate("EstablishmentId", "lookup_value");

    if (!data) return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

    return res.json(__requestResponse("200", __SUCCESS, data));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", error.message, __SOME_ERROR));
  }
});

module.exports = router;
