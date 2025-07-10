const express = require("express");
const router = express.Router();

const { __requestResponse } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const VenueBoothMap = require("../../../models/VenueBoothMap");

router.post("/SaveVenueBoothEventMap", async (req, res) => {
    try {
        const { VBEMapID, VenueID, EventID, BoothID } = req.body;

        if (!VBEMapID) {
            const newRec = await VenueBoothMap.create({
                VenueID,
                EventID,
                BoothID,
            });
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            const oldRec = await VenueBoothMap.findById(VBEMapID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await VenueBoothMap.updateOne(
                { _id: VBEMapID },
                { $set: { VenueID, EventID, BoothID } }
            );
            return res.json(__requestResponse("200", __SUCCESS));
        }
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/VenueBoothEventMapList", async (req, res) => {
    try {
        const list = await VenueBoothMap.find().populate([
            {
                path: "EventID VenueID BoothID",
                select: "EventName VenueName BoothName",
            },
        ]);
        return res.json(__requestResponse("200", __SUCCESS, list));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;
