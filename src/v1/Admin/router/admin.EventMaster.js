const express = require("express");
const router = express.Router();

const tlbEventMaster = require("../../../models/EventMaster");
const VenueMaster = require("../../../models/VenueMaster");
const SubVenue = require("../../../models/SubVenueMaster");

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

router.post("/EventListx", async (req, res) => {
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

// Venue Master API
router.post("/SaveVenue", validateSaveVenue, async (req, res) => {
  try {
    const {
      Venue_Id,
      Event_Id,
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
      Event_Id,
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

// Sub venue Master
//  Add multiple SubVenues
router.post("/SaveSubVenues", async (req, res) => {
  try {
    const { data } = req.body; // data: array of subvenue objects

    if (!Array.isArray(data) || data.length === 0)
      return res.json(__requestResponse("400", "Invalid or empty data"));

    // Check duplicates within the request itself
    const seen = new Set();
    for (let item of data) {
      const key = `${item.Event_Id}_${item.Venue_Id}_${item.SubVenueNo}`;
      if (seen.has(key)) {
        return res.json(
          __requestResponse(
            "400",
            `Duplicate SubVenueNo '${item.SubVenueNo}' in input`
          )
        );
      }
      seen.add(key);
    }

    // Check if any SubVenueNo already exists in DB for the same Event+Venue
    for (let item of data) {
      const exists = await SubVenue.findOne({
        Event_Id: item.Event_Id,
        Venue_Id: item.Venue_Id,
        SubVenueNo: item.SubVenueNo,
      });

      if (exists) {
        return res.json(
          __requestResponse(
            "400",
            `SubVenueNo '${item.SubVenueNo}' already exists for this event and venue`
          )
        );
      }
    }

    const savedRecords = await SubVenue.insertMany(data);

    await __CreateAuditLog(
      "sub_venue_master",
      "SubVenue.Add",
      null,
      null,
      data,
      null,
      null,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, savedRecords));
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});
//  NOTE:-
// If we are adding multiple values at once (as an array), we should:
// Use a separate bulk insert API (insertMany)
// ❌ Not use the same API as the add/edit single record pattern — because handling both add + edit in bulk complicates error handling,
//  especially when mixing new and existing _ids.

// Edit SubVenue
router.post("/EditSubVenue", async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    if (!_id)
      return res.json(__requestResponse("400", "SubVenue ID is required"));

    const oldData = await SubVenue.findById(_id);
    if (!oldData) return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

    const updated = await SubVenue.updateOne({ _id }, { $set: updateData });

    await __CreateAuditLog(
      "sub_venue_master",
      "SubVenue.Edit",
      null,
      oldData,
      updateData,
      _id,
      null,
      null
    );

    return res.json(__requestResponse("200", __SUCCESS, updated));
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// List SubVenues by Event
router.post("/ListSubVenues", async (req, res) => {
  try {
    const { Event_Id } = req.body;
    const filter = Event_Id ? { Event_Id } : {};

    const list = await SubVenue.find(filter)
      .populate("Event_Id", "EventTitle")
      .populate("Venue_Id", "City_Exhibition_Centre_Name")
      .populate("SubVenueTypeId", "lookup_value")
      .lean();

    return res.json(__requestResponse("200", __SUCCESS, __deepClone(list)));
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});



module.exports = router;
