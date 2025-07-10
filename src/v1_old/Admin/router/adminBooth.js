const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const BoothMaster = require("../../../models/BoothMaster");

router.post("/SaveBooth", async (req, res) => {
    try {
        const { BoothID, BoothName, AddressID, BoothCode, Floor } = req.body;

        if (!BoothID) {
            const newRec = await BoothMaster.create({
                BoothName,
                BoothCode,
                Floor,
            });
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            const oldRec = await BoothMaster.findById(BoothID);
            if (!oldRec)
                return res.json(__requestResponse("404", __RECORD_NOT_FOUND));

            await BoothMaster.updateOne(
                { _id: BoothID },
                { $set: { BoothName, BoothCode, Floor, AddressID } }
            );
            return res.json(__requestResponse("200", __SUCCESS));
        }
    } catch (error) {
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/BoothList", async (req, res) => {
    try {
        const list = await BoothMaster.find().populate([
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
