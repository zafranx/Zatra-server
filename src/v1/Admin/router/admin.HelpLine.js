const express = require("express");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { validateSaveHelpline } = require("../Middleware/helpline.validation");
const HelplineMaster = require("../../../models/HelplineMaster");

// Add / Edit Helpline
router.post("/SaveHelpline", validateSaveHelpline, async (req, res) => {
  try {
    const {
      _id,
      CityId,
      ContactPersonName,
      HelplineNumber,
      Email,
      AddressLine1,
      AddressLine2,
      PostalCode,
    } = req.body;

    const saveData = {
      CityId,
      ContactPersonName,
      HelplineNumber,
      Email,
      AddressLine1,
      AddressLine2,
      PostalCode,
    };

    if (!_id) {
      const newRec = await HelplineMaster.create(saveData);
      await __CreateAuditLog(
        "helpline_master",
        "Helpline.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await HelplineMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      await HelplineMaster.updateOne({ _id }, { $set: saveData });
      await __CreateAuditLog(
        "helpline_master",
        "Helpline.Edit",
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, saveData));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// List Helplines with pagination and search
router.post("/HelplineList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", CityId } = req.body;

    const filter = {};
    if (search) {
      filter.ContactPersonName = { $regex: search, $options: "i" };
    }
    if (CityId) {
      filter.CityId = CityId;
    }

    const total = await HelplineMaster.countDocuments(filter);
    const list = await HelplineMaster.find(filter)
      .populate("CityId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
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
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;
