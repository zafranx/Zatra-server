const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const tlbEventMaster = require("../../../models/EventMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");

router.post("/SaveEvent", async (req, res) => {
  try {
    const {
      event_id,
      AssetId,
      EventName,
      EventTypeID,
      TripCategoryID,
      address,
      GeoAddress,
      CityID,
      Organizers,
      EventFromDate,
      EventToDate,
      AddressID,
      BannerImg,
    } = req.body;

    // Validate and set GeoAddress only if it's correctly provided
    // let finalGeoAddress = undefined;
    // if (
    //     GeoAddress &&
    //     Array.isArray(GeoAddress) &&
    //     GeoAddress.length === 2
    // ) {
    //     finalGeoAddress = {
    //         type: "Point",
    //         coordinates: GeoAddress,
    //     };
    // }

    const eventData = {
      AssetId: AssetId,
      EventName: EventName,
      EventTypeID: EventTypeID,
      TripCategoryID: TripCategoryID,
      Address: address,
      CityID: CityID,
      Organizers: Organizers,
      EventFromDate: EventFromDate,
      EventToDate: EventToDate,
      AddressID: AddressID,
      BannerImg: BannerImg,
      // ...(finalGeoAddress && { GeoAddress: finalGeoAddress }),
    };

    if (!event_id) {
      const newEvent = await tlbEventMaster.create(eventData);
      await __CreateAuditLog(
        "event_masters",
        "Event.Add",
        null,
        null,
        eventData,
        newEvent._id,
        AssetId,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, newEvent));
    } else {
      const oldRec = await tlbEventMaster.findById(event_id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await tlbEventMaster.updateOne(
        { _id: event_id },
        { $set: eventData }
      );
      await __CreateAuditLog(
        "event_masters",
        "Event.Edit",
        null,
        oldRec,
        eventData,
        event_id,
        AssetId,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/EventList", async (req, res) => {
  try {
    const eventList = await tlbEventMaster
      .find({})
      .populate([
        {
          path: "AssetId",
          select: "AssetName",
        },
        {
          path: "EventTypeID TripCategoryID CityID",
          select: "lookup_value",
        },
        {
          path: "AddressID",
          select: "AddressLine1 AddressLine2 PIN AddressTypeId",
          populate: {
            path: "AddressTypeId",
            select: "lookup_value",
          },
        },
      ])
      .sort({ EventFromDate: -1 }) //  Latest events first
      .lean();

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(eventList).map((item) => {
          return {
            ...item,
            AddressID: item.AddressID
              ? {
                  _id: item.AddressID._id,
                  lookup_value: item.AddressID.AddressTypeId?.lookup_value,
                  line1: item.AddressID.AddressLine1,
                  line2: item.AddressID.AddressLine2,
                  pin: item.AddressID.PIN,
                  full_address: `${item?.AddressID.AddressLine1}, ${item?.AddressID.AddressLine2}, ${item?.AddressID.PIN}`,
                }
              : null,
          };
        })
      )
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;
