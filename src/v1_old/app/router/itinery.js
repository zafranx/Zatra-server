const express = require("express");
const router = express.Router();

const {
    __SUCCESS,
    __SOME_ERROR,
    __DATA_404,
} = require("../../../utils/variable");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __fetchToken } = require("../middleware/authentication");
const { default: mongoose } = require("mongoose");
const { __checkValidFileds } = require("../middleware/itinerymiddleware");
const ItineraryMaster = require("../../../models/ItineraryMaster");

router.post(
    "/CreateItinerary",
    [__fetchToken, __checkValidFileds],
    async (req, res) => {
        try {
            const {
                UserID,
                FromDate,
                ToDate,
                TotalAdultsPassangers,
                TotalChildrenPassangers,
                Halts,
            } = req.body;
            const ininery = await ItineraryMaster.create({
                UserID,
                FromDate,
                ToDate,
                TotalAdultsPassangers,
                TotalChildrenPassangers,
                Destinations: Halts,
            });
            return res.json(__requestResponse("200", "Success", ininery));
        } catch (error) {
            console.log(error);
            return res.json(__requestResponse("500", __SOME_ERROR, error));
        }
    }
);
router.post("/GetItinerary", [__fetchToken], async (req, res) => {
    try {
        const { UserID } = req.body;
        const ininery = await ItineraryMaster.find({
            UserID,
        }).populate({ path: "Destinations.CityId" });
        return res.json(__requestResponse("200", "Success", ininery));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/GetCurrentItinerary", [__fetchToken], async (req, res) => {
    try {
        const { UserID } = req.body;
        const currentDate = new Date();
        const ininery = await ItineraryMaster.findOne({
            UserID,
            FromDate: { $lte: currentDate },
            ToDate: { $gte: currentDate },
        }).populate({ path: "Destinations.CityId" });

        return res.json(__requestResponse("200", "Success", ininery));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
module.exports = router;
