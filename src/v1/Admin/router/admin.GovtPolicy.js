const express = require("express");
const router = express.Router();

const GovtPolicyMaster = require("../../../models/GovtPolicyMaster");
const {
  validateSaveGovtPolicy,
} = require("../Middleware/govtPolicy.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// Add / Edit Policy
router.post("/SaveGovtPolicy", validateSaveGovtPolicy, async (req, res) => {
  try {
    const {
      _id,
      CityId,
      PolicyTitle,
      ShortDesc,
      LongDesc,
      Eligibility,
      GovernmentAuthority,
      PolicyDocument,
    } = req.body;

    const saveData = {
      CityId,
      PolicyTitle,
      ShortDesc,
      LongDesc,
      Eligibility,
      GovernmentAuthority,
      PolicyDocument,
    };

    if (!_id) {
      const newRec = await GovtPolicyMaster.create(saveData);
      await __CreateAuditLog(
        "govt_policy_master",
        "Policy.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await GovtPolicyMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      await GovtPolicyMaster.updateOne({ _id }, { $set: saveData });
      await __CreateAuditLog(
        "govt_policy_master",
        "Policy.Edit",
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

// List API
router.post("/GovtPolicyList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", CityId } = req.body;
    const filter = {};

    if (search) filter.PolicyTitle = { $regex: search, $options: "i" };
    if (CityId) filter.CityId = CityId;

    const total = await GovtPolicyMaster.countDocuments(filter);
    const list = await GovtPolicyMaster.find(filter)
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
