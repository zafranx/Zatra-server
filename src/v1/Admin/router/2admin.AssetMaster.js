const express = require("express");
const router = express.Router();

const LegalEntity = require("../../../models/AssetMaster");
const {
  validateSaveLegalEntity,
} = require("../Middleware/2assetMaster.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// Save Legal Entity (Add / Edit)
router.post("/SaveLegalEntity", validateSaveLegalEntity, async (req, res) => {
  try {
    const {
      _id,// for edit
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
      SubSector,
    } = req.body;

    const saveData = {
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
      SubSector,
    };

    if (!_id) {
      const newRec = await LegalEntity.create(saveData);
      await __CreateAuditLog(
        "legal_entity",
        "LegalEntity.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await LegalEntity.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await LegalEntity.updateOne({ _id }, { $set: saveData });
      await __CreateAuditLog(
        "legal_entity",
        "LegalEntity.Edit",
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// List Legal Entities with Pagination + Filter
router.post("/LegalEntityList", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      LegalEntityTypeId,
      Industry_Sector,
    } = req.body;

    const filter = {};
    if (search) {
      filter.Name = { $regex: search, $options: "i" };
    }
    if (LegalEntityTypeId) filter.LegalEntityTypeId = LegalEntityTypeId;
    if (Industry_Sector) filter.Industry_Sector = Industry_Sector;

    const total = await LegalEntity.countDocuments(filter);
    const list = await LegalEntity.find(filter)
      .populate("LegalEntityTypeId", "lookup_value")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page,
        limit,
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;
