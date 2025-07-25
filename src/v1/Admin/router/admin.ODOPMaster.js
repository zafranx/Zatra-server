const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const ODOPMaster = require("../../../models/ODOPMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
// const {
//   validateCityIndicator,
// } = require("../Middleware/cityIndicator.validation");

//  Save ODOP  (Add / Edit)
router.post("/SaveODOP", async (req, res) => {
  try {
    const {
      _id,
      CityId,
      ProductName,
      PictureGallery,
      VideoGallery,
      ShortDescription,
      LongDescription,
    } = req.body;

    const saveData = {
      CityId,
      ProductName,
      PictureGallery,
      VideoGallery,
      ShortDescription,
      LongDescription,
    };

    if (!_id) {
      const newRec = await ODOPMaster.create(saveData);
      await __CreateAuditLog(
        "ODOP_master",
        "ODOPMaster.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await ODOPMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      //   await ODOPMaster.updateOne({ _id }, { $set: saveData });
      const updated = await ODOPMaster.updateOne(
        { _id },
        { $set: saveData }
      );

      await __CreateAuditLog(
        "ODOP_master",
        "ODOPMaster.Edit",      
        null,
        oldRec,
        saveData,
        _id
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500",error, __SOME_ERROR,));
  }
});

// ODOP List
// (City ID, Search, Page, Limit)
router.post("/ODOPList", async (req, res) => {
  try {
    const { CityId, search, page = 1, limit = 10 } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (search) filter.ProductName = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ODOPMaster.find(filter)               
        .populate("CityId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ODOPMaster.countDocuments(filter),
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
