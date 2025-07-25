const express = require("express");
const router = express.Router();

const AssetUser = require("../../../models/AssetUserMaster");
const { validateSaveAssetUser } = require("../Middleware/assetUser.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

// Save (Add/Edit) Asset User
router.post("/SaveAssetUser", validateSaveAssetUser, async (req, res) => {
  try {
    const { _id, AssetId, Name, Phone, Password, IsActive } = req.body;

    const saveData = { AssetId, Name, Phone, Password, IsActive };

    if (!_id) {
      const newRec = await AssetUser.create(saveData);
      await __CreateAuditLog(
        "asset_user_master",
        "AssetUser.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await AssetUser.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await AssetUser.updateOne({ _id }, { $set: saveData });
      await __CreateAuditLog(
        "asset_user_master",
        "AssetUser.Edit",
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// List Asset Users
router.post("/AssetUserList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", AssetId, IsActive } = req.body;

    const filter = {};
    if (AssetId) filter.AssetId = AssetId;
    if (search) filter.Name = { $regex: search, $options: "i" };
    if (typeof IsActive === "boolean") filter.IsActive = IsActive;

    const skip = (page - 1) * limit;
    const [list, total] = await Promise.all([
      AssetUser.find(filter)
        .populate("AssetId", "Name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssetUser.countDocuments(filter),
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
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});


module.exports = router;
