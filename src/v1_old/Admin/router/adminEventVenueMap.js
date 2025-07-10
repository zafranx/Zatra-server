const express = require("express");
const router = express.Router();

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const EventVenueMap = require("../../../models/EventVenueMap");

router.post("/SaveEventVenueMap", async (req, res) => {
    try {
        const { EventVenueMapID, VenueID, EventID } = req.body;

        if (!EventVenueMapID) {
            const newRec = await EventVenueMap.create({ VenueID, EventID });
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            const oldRec = await EventVenueMap.findById(EventVenueMapID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await EventVenueMap.updateOne(
                { _id: EventVenueMapID },
                { $set: { VenueID, EventID } }
            );
            return res.json(__requestResponse("200", __SUCCESS));
        }
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/EventVenueMapList", async (req, res) => {
    try {
        const list = await EventVenueMap.find().populate([
            {
                path: "EventID VenueID",
                select: "EventName VenueName",
            },
        ]);
        return res.json(__requestResponse("200", __SUCCESS, list));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;
