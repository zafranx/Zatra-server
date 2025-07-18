const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DestinationMaster = require("../../../models/DestinationMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateSaveDestination,
} = require("../Middleware/destinationMaster.validation");

//  Save Destination (Add / Edit)
router.post("/SaveDestination", validateSaveDestination, async (req, res) => {
  try {
    const {
      _id,
      DestinationTypeId,
      Destination,
      ShortDescription,
      WikiPageLink,
      CityId,
      Geolocation,
      PictureGallery,
      VideoGallery,
    } = req.body;

    const saveData = {
      DestinationTypeId,
      Destination,
      ShortDescription,
      WikiPageLink,
      CityId,
      Geolocation,
      PictureGallery,
      VideoGallery,
    };

    if (!_id) {
      const newRec = await DestinationMaster.create(saveData);
      await __CreateAuditLog(
        "destination_master",
        "Destination.Add",
        null,
        null,
        saveData,
        newRec._id
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await DestinationMaster.findById(_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      //   await DestinationMaster.updateOne({ _id }, { $set: saveData });
      const updated = await DestinationMaster.updateOne(
        { _id },
        { $set: saveData }
      );

      await __CreateAuditLog(
        "destination_master",
        "Destination.Edit",
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

// Destination List
// (City ID, Destination Type ID, Search, Page, Limit)
router.post("/DestinationList", async (req, res) => {
  try {
    const {
      CityId,
      DestinationTypeId,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (DestinationTypeId) filter.DestinationTypeId = DestinationTypeId;
    if (search) filter.Destination = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DestinationMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("DestinationTypeId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationMaster.countDocuments(filter),
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
