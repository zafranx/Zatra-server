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

// Add/Edit Zatra -- SaveZatra
router.post("/SaveZatra", validateSaveZatra, async (req, res) => {
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

router.post("/ZatraList", async (req, res) => {
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
