const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const ZatraMaster = require("../../../models/ZatraMaster");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { validateSaveZatra } = require("../Middleware/zatraMaster.validation");



// 🔹 Add/Edit Zatra
router.post("/SaveZatra", validateSaveZatra, async (req, res) => {
  try {
    const payload = req.body;

    let mongoId = null;
    if (payload._id && mongoose.Types.ObjectId.isValid(payload._id)) {
      mongoId = mongoose.Types.ObjectId(payload._id);
    }

    if (!mongoId) {
      // Create new
      const newRec = await ZatraMaster.create(payload);
      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Save",
        null,
        null,
        newRec,
        newRec._id,
        null,
        null
      );
      return res.json(__requestResponse("200", "Zatra created successfully", newRec));
    } else {
      // Update existing
      const oldRec = await ZatraMaster.findById(mongoId);
      if (!oldRec) {
        return res.json(__requestResponse("404", __RECORD_NOT_FOUND, {}));
      }

      const updated = await ZatraMaster.findByIdAndUpdate(
        mongoId,
        { ...payload, updatedAt: new Date() },
        { new: true }
      );

      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Edit",
        null,
        oldRec,
        updated,
        mongoId,
        null,
        null
      );

      return res.json(__requestResponse("200", "Zatra updated successfully", updated));
    }
  } catch (error) {
    console.error(" SaveZatra Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// 🔹 List Zatra
router.post("/ZatraList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.body;

    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { Name: { $regex: search, $options: "i" } },
        { ShortDescription: { $regex: search, $options: "i" } },
      ];
    }

    const [list, total] = await Promise.all([
      ZatraMaster.find(query)
        .populate("ZatraTypeId", "lookup_value")
        .populate("EnrouteStations.StateId", "lookup_value")
        .populate("EnrouteStations.CityId", "lookup_value")
        .populate("Organizers", "OrganizerName ContactName EmailAddress IsSponsor")
        .populate("Sponsors", "OrganizerName ContactName EmailAddress IsSponsor")
        .populate("OrganizerAdmins", "UserId RoleId")
        .populate("SponsorAdmins", "UserId RoleId")
        .populate("ZatraAdmins", "UserId RoleId")
        .populate("RegistrationFees.FeeCategory", "lookup_value")
        .populate("ZatraSocialMedia.SocialMediaId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ZatraMaster.countDocuments(query),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(list),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(" ZatraList Error:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error.message));
  }
});

// Add/Edit Zatra -- SaveZatra
router.post("/SaveZatra-old", async (req, res) => {
  try {
    const {
      _id,
      ZatraType,
      ZatraName,
      Logo,
      Website,
      StartDate,
      EndDate,
      ZatraOrganisers,
      CityId = [],
      ZatraCategoryId,
    } = req.body;

    const saveData = {
      ZatraType,
      ZatraName,
      Logo,
      Website,
      StartDate,
      EndDate,
      ZatraOrganisers,
      CityId,
      ZatraCategoryId,
    };

    let mongoId = null;
    if (_id && mongoose.Types.ObjectId.isValid(_id)) {
      mongoId = mongoose.Types.ObjectId(_id);
    }

    if (!mongoId) {
      const newRec = await ZatraMaster.create(saveData);
      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await ZatraMaster.findById(mongoId);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await ZatraMaster.updateOne(
        { _id: mongoId },
        { $set: saveData }
      );
      await __CreateAuditLog(
        "zatra_master",
        "Zatra.Edit",
        null,
        oldRec,
        saveData,
        mongoId
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/ZatraList-old", async (req, res) => {
  try {
    const {
      ZatraType,
      ZatraName,
      CityId,
      StartDate,
      EndDate,
      page = 1,
      limit = 10,
      ZatraCategoryId,
    } = req.body;

    const filter = {};

    if (ZatraType) filter.ZatraType = ZatraType;
    if (ZatraName) filter.ZatraName = { $regex: ZatraName, $options: "i" };
    if (StartDate) filter.StartDate = { $gte: new Date(StartDate) };
    if (EndDate) filter.EndDate = { $lte: new Date(EndDate) };
    if (CityId) filter.CityId = { $in: CityId };
    if (ZatraCategoryId) filter.ZatraCategoryId = { $in: ZatraCategoryId };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ZatraMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("ZatraCategoryId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ZatraMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(data),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});
  
module.exports = router;
