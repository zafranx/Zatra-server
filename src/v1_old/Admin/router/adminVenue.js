const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const VenueMaster = require("../../../models/VenueMaster");

router.post("/SaveVenue", async (req, res) => {
    try {
        const { VenueID, VenueName, AddressID } = req.body;

        if (!VenueID) {
            const newRec = await VenueMaster.create({ VenueName });
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            const oldRec = await VenueMaster.findById(VenueID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await VenueMaster.updateOne(
                { _id: VenueID },
                { $set: { VenueName, AddressID } }
            );
            return res.json(__requestResponse("200", __SUCCESS));
        }
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/VenueList", async (req, res) => {
    try {
        const list = await VenueMaster.find().populate([
            {
                path: "AddressID",
                select: "AddressLine1 AddressLine2 PIN AddressTypeId",
                populate: {
                    path: "AddressTypeId",
                    select: "lookup_value",
                },
            },
        ]);
        return res.json(
            __requestResponse(
                "200",
                __SUCCESS,
                __deepClone(list).map((item) => {
                    return {
                        ...item,
                        AddressID: item.AddressID
                            ? {
                                  _id: item.AddressID._id,
                                  lookup_value:
                                      item.AddressID.AddressTypeId
                                          ?.lookup_value,
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
        return res.json(__requestResponse("500", __SOME_ERROR, error.message));
    }
});

module.exports = router;
