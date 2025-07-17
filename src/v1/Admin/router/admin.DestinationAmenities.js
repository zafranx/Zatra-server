const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const DestinationAmenitiesMaster = require("../../../models/DestinationAmenitiesMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateSaveDestinationAmenities,
} = require("../Middleware/destinationAmenities.validation");

//  Save DestinationAmenities (Add / Edit)
router.post(
  "/SaveDestinationAmenities",
  validateSaveDestinationAmenities,
  async (req, res) => {
    try {
      const {
        _id,
        CityId,
        DestinationId,
        AmenityTypeId,
        Geolocation,
        IsActive,
      } = req.body;

      const saveData = {
        _id: mongoose.Types.ObjectId(_id),
        CityId: mongoose.Types.ObjectId(CityId),
        DestinationId: mongoose.Types.ObjectId(DestinationId),
        AmenityTypeId: mongoose.Types.ObjectId(AmenityTypeId),
        Geolocation,
        IsActive,
      };

      if (!_id || _id === "" || _id === null) {
        const newRec = await DestinationAmenitiesMaster.create(saveData);
        await __CreateAuditLog(
          "destination_amenities_master",
          "DestinationAmenities.Add",
          null,
          null,
          saveData,
          newRec._id
        );
        return res.json(__requestResponse("200", __SUCCESS, newRec));
      } else {
        const oldRec = await DestinationAmenitiesMaster.findById(_id);
        if (!oldRec)
          return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

        //   await DestinationAmenitiesMaster.updateOne({ _id }, { $set: saveData });
        const updated = await DestinationAmenitiesMaster.updateOne(
          { _id },
          { $set: saveData }
        );

        await __CreateAuditLog(
          "destination_amenities_master",
          "DestinationAmenities.Edit",
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
  }
);

// DestinationAmenities List 
// (City ID, DestinationID, AmenityID, Search, Page, Limit)
router.post("/DestinationAmenitiesList", async (req, res) => {
  try {
    const {
      CityId,
      DestinationId,
      AmenityTypeId,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (DestinationId) filter.DestinationId = DestinationId;
    if (AmenityTypeId) filter.AmenityTypeId = AmenityTypeId;
    if (search) filter.Amenity = { $regex: search, $options: "i" };     

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DestinationAmenitiesMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("DestinationId", "lookup_value")
        .populate("AmenityTypeId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationAmenitiesMaster.countDocuments(filter),
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
