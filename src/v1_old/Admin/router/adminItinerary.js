const express = require("express");
const router = express.Router();

const {
    __SUCCESS,
    __SOME_ERROR,
    __DATA_404,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");
const ItineraryMaster = require("../../../models/ItineraryMaster");
const {
    __checkValidFileds,
} = require("../../app/middleware/itinerymiddleware");

router.post("/SaveItinerary", [__checkValidFileds], async (req, res) => {
    try {
        const {
            ItineraryID,
            UserID,
            FromDate,
            ToDate,
            TotalAdultsPassangers,
            TotalChildrenPassangers,
            Halts,
        } = req.body;
        if (!ItineraryID) {
            const ininery = await ItineraryMaster.create({
                UserID,
                FromDate,
                ToDate,
                TotalAdultsPassangers,
                TotalChildrenPassangers,
                Destinations: Halts,
            });
            return res.json(__requestResponse("200", "Success", ininery));
        } else {
            // Edit existing asset
            const oldRec = await ItineraryMaster.findById(ItineraryID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await ItineraryMaster.updateOne(
                { _id: ItineraryID },
                {
                    $set: {
                        UserID,
                        FromDate,
                        ToDate,
                        TotalAdultsPassangers,
                        TotalChildrenPassangers,
                        Destinations: Halts,
                    },
                }
            );

            return res.json(__requestResponse("200", __SUCCESS, "data saved"));
        }
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/ItineraryList", async (req, res) => {
    try {
        const ininery = await ItineraryMaster.find().populate({
            path: "Destinations.CityId",
        });
        return res.json(__requestResponse("200", "Success", ininery));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
