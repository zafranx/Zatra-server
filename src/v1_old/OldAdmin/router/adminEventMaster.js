const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { checkEventData } = require("../Middleware/middleEvent");
const EventMaster = require("../../../models/EventMaster");

router.post("/SaveEvent", checkEventData, async (req, res) => {
  const APIEndPointNo = "#EVENT001";
  try {
    let {
      event_id,
      eventTitle,
      categoryId,
      subCategoryId,
      destinationId,
      startDate,
      endDate,
      addressId,
      cityId,
      cityGroupId,
      images,
      videos,
    } = req.body;

    const _eventData = {
      EventTitle: eventTitle,
      CategoryID: mongoose.Types.ObjectId(categoryId),
      SubCategoryID: subCategoryId
        ? mongoose.Types.ObjectId(subCategoryId)
        : null,
      DestinationID: destinationId
        ? mongoose.Types.ObjectId(destinationId)
        : null,
      StartDate: startDate ? new Date(startDate) : null,
      EndDate: endDate ? new Date(endDate) : null,
      AddressID: addressId ? mongoose.Types.ObjectId(addressId) : null,
      CityID: cityId ? mongoose.Types.ObjectId(cityId) : null,
      CityGroupID: cityGroupId
        ? cityGroupId.map((id) => mongoose.Types.ObjectId(id))
        : [],
      Images: images || [],
      Videos: videos || [],
    };

    if (!event_id) {
      // Create a new event
      const newEvent = await EventMaster.create(_eventData);
      __CreateAuditLog(
        "event_master",
        "Event.Add",
        null,
        null,
        _eventData,
        newEvent._id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Event added successfully.", newEvent)
      );
    } else {
      // Update existing event
      const existingEvent = await EventMaster.findOne({ _id: event_id });
      if (!existingEvent) {
        return res.json(__requestResponse("400", "Event not found"));
      }

      const updatedEvent = await EventMaster.updateOne(
        { _id: event_id },
        { $set: _eventData }
      );

      __CreateAuditLog(
        "event_master",
        "Event.Edit",
        null,
        existingEvent,
        _eventData,
        event_id,
        null,
        null
      );
      return res.json(
        __requestResponse("200", "Event updated successfully.", updatedEvent)
      );
    }
  } catch (error) {
    return res.json(
      __requestResponse(
        "500",
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
        error
      )
    );
  }
});

// GET Brand List
router.get("/GetEventList", async (req, res) => {
  try {
    const eventList = await EventMaster.find()
      .populate("AssetId", "AssetName") // Populate Asset Name from Asset Master
      .populate("CategoryID", "lookup_value") // Populate Category Name from Lookups
      .populate("SubCategoryID", "lookup_value"); // Populate SubCategory Name from Lookups
    // .populate("AddressID", "lookup_value"); // Populate AddressID  from address master

    if (!eventList || eventList.length === 0) {
      return res.json(__requestResponse("404", __RECORD_NOT_FOUND));
    }

    return res.json(
      __requestResponse("200", __SUCCESS, {
        eventList: __deepClone(eventList).map((data) => ({
          event_id: data._id,
          eventTitle: data.EventTitle,
          assetName: data.AssetId?.AssetName,
          categoryId: data.CategoryID?._id,
          categoryName: data.CategoryID?.lookup_value,
          subCategoryId: data.SubCategoryID?._id,
          subCategoryName: data.SubCategoryID?.lookup_value,
          destinationID: data.DestinationID,
          startDate: data.StartDate,
          endDate: data.EndDate,
          addressID: data.AddressID,
          cityID: data.CityID,
          CityGroupID: data.CityGroupID,
          images: data.Images,
          videos: data.Videos,
        })),
      })
    );
  } catch (error) {
    console.error("Error in GeteventList:", error);
    return res.json(
      __requestResponse(
        "500",
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`,
        error
      )
    );
  }
});

module.exports = router;
