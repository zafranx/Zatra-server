const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const CityIndicator = require("../../../models/CityIndicator");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateCityIndicator,
} = require("../Middleware/cityIndicator.validation");
  
//  Save City Indicator (Add / Edit)
router.post("/SaveCityIndicator",validateCityIndicator, async (req, res) => {
  try {
    const {
      _id,
      CityStationId,
      PanchtatvaCategory_Level1_Id,
      PanchtatvaCategory_Level2_Id,
      PanchtatvaCategory_Level3_Id,
      Name,
      ShortDescription,
      LongDescription,
      PictureGallery,
      VideoGallery,
    } = req.body;

    const saveData = {
      CityStationId,
      PanchtatvaCategory_Level1_Id,
      PanchtatvaCategory_Level2_Id,
      PanchtatvaCategory_Level3_Id,
      Name,
      ShortDescription,
      LongDescription,
      PictureGallery,
      VideoGallery,
    };

    if (!_id) {
      const newRec = await CityIndicator.create(saveData);
      await __CreateAuditLog(
        "city_indicator",
        "CityIndicator.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await CityIndicator.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      //   await CityIndicator.updateOne({ _id }, { $set: saveData });
      const updated = await CityIndicator.updateOne(
        { _id },
        { $set: saveData }
      );

      await __CreateAuditLog(
        "city_indicator",
        "CityIndicator.Edit",
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

// City Indicator List
// (City ID, Search, Page, Limit)
router.post("/CityIndicatorList", async (req, res) => {
  try {
    const {
      CityId,
      search,
      page = 1,
      limit = 10,
    } = req.body;
    
    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (search) filter.Destination = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      CityIndicator.find(filter)
        .populate("CityId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CityIndicator.countDocuments(filter),
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
