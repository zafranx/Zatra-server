const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const TripMaster = require("../../../models/TripMaster");

router.post("/SaveTrip", async (req, res) => {
    try {
        const {
            TripID,
            TripName,
            TripTypeID,
            TripCategoryID,
            TripFromDate,
            TripToDate,
            Remarks,
            Destinations,
        } = req.body;

        const tripData = {
            TripName,
            TripTypeID,
            TripCategoryID,
            FromDate: TripFromDate,
            ToDate: TripToDate,
            Remarks,
            Destinations:
                Destinations.length > 0
                    ? Destinations.map((item) => ({ CityID: item }))
                    : [],
        };

        if (!TripID) {
            const newEvent = await TripMaster.create(tripData);

            return res.json(__requestResponse("200", __SUCCESS, newEvent));
        } else {
            const oldRec = await TripMaster.findById(TripID);
            if (!oldRec)
                return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

            const updated = await TripMaster.updateOne(
                { _id: TripID },
                { $set: tripData }
            );

            return res.json(__requestResponse("200", __SUCCESS, updated));
        }
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/TripList", async (req, res) => {
    try {
        const eventList = await TripMaster.find({})
            .populate("TripTypeID", "lookup_value")
            .populate("TripCategoryID", "lookup_value")
            .populate("Destinations.CityID", "lookup_value")
            .lean();

        return res.json(
            __requestResponse(
                "200",
                __SUCCESS,
                __deepClone(eventList).map((item) => ({
                    ...item,
                    Destinations: item.Destinations.map((city) => city.CityID),
                }))
            )
        );
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/SaveTripDestinations", async (req, res) => {
    try {
        const { TripId, CityID, DestinationId } = req.body;

        if (!CityID || !DestinationId) {
            return res.json(
                __requestResponse("400", "City and Destination Id is required")
            );
        }

        let result;

        if (DestinationId) {
            // Edit existing category
            result = await TripMaster.updateOne(
                { "Destinations._id": DestinationId },
                { $set: { "Destinations.$.CityID": CityID } }
            );
        } else {
            // Add new category to specific asset
            if (!TripId) {
                return res.json(
                    __requestResponse("400", "Trip ID is required")
                );
            }
            result = await TripMaster.findByIdAndUpdate(
                TripId,
                {
                    $push: {
                        Destinations: { CityID: CityID },
                    },
                },
                { new: true }
            );
        }

        return res.json(__requestResponse("200", __SUCCESS, result));
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});
router.post("/ListTripDestinations", async (req, res) => {
    try {
        const { TripId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(TripId)) {
            return res.json(__requestResponse("400", "Invalid Trip ID"));
        }

        const asset = await TripMaster.findById(
            TripId,
            "Destinations"
        ).populate("Destinations.CityID", "lookup_value");

        if (!asset) {
            return res.json(__requestResponse("404", "Asset not found"));
        }

        return res.json(
            __requestResponse("200", __SUCCESS, asset.Destinations)
        );
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;
