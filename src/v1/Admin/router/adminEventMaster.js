const express = require("express");
const router = express.Router();

const tlbEventMaster = require("../../../models/EventMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const { validateSaveEvent } = require("../Middleware/eventMaster.validation");

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


module.exports = router;
