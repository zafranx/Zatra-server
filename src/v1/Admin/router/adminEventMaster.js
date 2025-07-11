const express = require("express");
const router = express.Router();

const tlbEventMaster = require("../../../models/EventMaster");
const VenueMaster = require("../../../models/VenueMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
  validateSaveEvent,
  validateSaveVenue,
} = require("../Middleware/eventMaster.validation");

router.post("/SaveEvent", validateSaveEvent, async (req, res) => {
  try {
    const {
      event_id,
      EventTypeId,
      Category,
      EventTitle,
      StartDate,
      EndDate,
      Logo,
      EventOrganisers,
      EventCatalogue,
      EventVenueType,
      Comments,
    } = req.body;

    const eventData = {
      EventTypeId,
      Category,
      EventTitle,
      StartDate,
      EndDate,
      Logo,
      EventOrganisers,
      EventCatalogue,
      EventVenueType,
      Comments,
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
        null,
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
        null,
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
    const { type } = req.body; // 'ongoing', 'upcoming', 'past'
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to compare by date
    let filter = {};

    if (type === "ongoing") {
      filter = {
        $expr: {
          $and: [
            {
              $lte: [
                { $dateTrunc: { date: "$StartDate", unit: "day" } },
                today,
              ],
            },
            {
              $gte: [{ $dateTrunc: { date: "$EndDate", unit: "day" } }, today],
            },
          ],
        },
      };
    } else if (type === "upcoming") {
      filter = {
        StartDate: { $gt: today },
      };
    } else if (type === "past") {
      filter = {
        EndDate: { $lt: today },
      };
    }

    const eventList = await tlbEventMaster
      .find(filter)
      .populate([
        {
          path: "EventTypeId",
          select: "lookup_value",
        },
      ])
      .sort({ StartDate: -1 })
      .lean();

    const result = __deepClone(eventList).map((event) => {
      const eventDate = new Date(event.StartDate);
      eventDate.setHours(0, 0, 0, 0);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let status = "";
      if (diffDays === 0) status = "Today";
      else if (diffDays > 0)
        status = `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      else
        status = `${Math.abs(diffDays)} day${
          Math.abs(diffDays) > 1 ? "s" : ""
        } ago`;

      return {
        ...event,
        Status: status,
      };
    });

    return res.json(__requestResponse("200", __SUCCESS, result));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/EventList3", async (req, res) => {
  try {
    const { type } = req.body; // 'ongoing', 'upcoming', 'past'
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to compare by date
    let filter = {};

    if (type === "ongoing") {
      filter = {
        StartDate: { $lte: today },
        EndDate: { $gte: today },
      };
    } else if (type === "upcoming") {
      filter = {
        StartDate: { $gt: today },
      };
    } else if (type === "past") {
      filter = {
        EndDate: { $lt: today },
      };
    }

    const eventList = await tlbEventMaster
      .find(filter)
      .populate([
        {
          path: "EventTypeId",
          select: "lookup_value",
        },
      ])
      .sort({ StartDate: -1 })
      .lean();

    const result = __deepClone(eventList).map((event) => {
      const eventDate = new Date(event.StartDate);
      eventDate.setHours(0, 0, 0, 0);
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      let status = "";
      if (diffDays === 0) status = "Today";
      else if (diffDays > 0)
        status = `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      else
        status = `${Math.abs(diffDays)} day${
          Math.abs(diffDays) > 1 ? "s" : ""
        } ago`;

      return {
        ...event,
        Status: status,
      };
    });

    return res.json(__requestResponse("200", __SUCCESS, result));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/EventListx", async (req, res) => {
  try {
    const eventList = await tlbEventMaster
      .find({})
      .populate([
        {
          path: "EventTypeId",
          select: "lookup_value",
        },
      ])
      .sort({ StartDate: -1 })
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, __deepClone(eventList))
    );
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// Venue Master API
router.post("/SaveVenue", validateSaveVenue, async (req, res) => {
  try {
    const {
      Venue_Id,
      VenueTypeId,
      City_Exhibition_Centre_Name,
      Layout_Doc,
      Address_line1,
      Address_line2,
      PostalCode,
      StateId,
      CityId,
      Geolocation,
    } = req.body;

    const venueData = {
      VenueTypeId,
      City_Exhibition_Centre_Name,
      Layout_Doc,
      Address_line1,
      Address_line2,
      PostalCode,
      StateId,
      CityId,
      Geolocation,
    };

    if (!Venue_Id) {
      const newRec = await VenueMaster.create(venueData);
      await __CreateAuditLog(
        "venue_masters",
        "Venue.Add",
        null,
        null,
        venueData,
        newRec._id,
        null,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, newRec));
    } else {
      const oldRec = await VenueMaster.findById(Venue_Id);
      if (!oldRec)
        return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

      const updated = await VenueMaster.updateOne(
        { _id: Venue_Id },
        { $set: venueData }
      );
      await __CreateAuditLog(
        "venue_masters",
        "Venue.Edit",
        null,
        oldRec,
        venueData,
        Venue_Id,
        null,
        null
      );
      return res.json(__requestResponse("200", __SUCCESS, updated));
    }
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

router.post("/VenueList", async (req, res) => {
  try {
    const venues = await VenueMaster.find({})
      .populate([
        { path: "VenueTypeId", select: "lookup_value" },
        { path: "StateId", select: "lookup_value" },
        { path: "CityId", select: "lookup_value" },
      ])
      .sort({ createdAt: -1 })
      .lean();

    return res.json(__requestResponse("200", __SUCCESS, __deepClone(venues)));
  } catch (error) {
    console.log(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});



module.exports = router;
