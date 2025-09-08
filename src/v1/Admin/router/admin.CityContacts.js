// routes/cityContact.routes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const CityContactMaster = require("../../../models/CityContactMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const {
    validateSaveCityContact,
} = require("../Middleware/cityContact.validation.js");

// Save City Contact (Add/Edit)
router.post(
    "/SaveCityContact",
    // validateSaveCityContact,

    async (req, res) => {
        try {
            const {
                _id,
                CityId,
                ContactTypeId,
                ContactName,
                Designation,
                Image,
                Phone,
                Email,
                Website,
                AddressLine1,
                AddressLine2,
                PostalCode,
            } = req.body;

            const saveData = {
                CityId,
                ContactTypeId,
                ContactName,
                Designation,
                Image,
                Phone,
                Email,
                Website,
                AddressLine1,
                AddressLine2,
                PostalCode,
            };

            if (!_id || _id === "" || _id === null) {
                const newRec = await CityContactMaster.create(saveData);
                await __CreateAuditLog(
                    "city_contact_master",
                    "CityContact.Add",
                    null,
                    null,
                    saveData,
                    newRec._id
                );
                return res.json(__requestResponse("200", __SUCCESS, newRec));
            } else {
                const oldRec = await CityContactMaster.findById(_id);
                if (!oldRec)
                    return res.json(
                        __requestResponse("400", __RECORD_NOT_FOUND)
                    );

                const updated = await CityContactMaster.updateOne(
                    { _id },
                    { $set: saveData }
                );
                await __CreateAuditLog(
                    "city_contact_master",
                    "CityContact.Edit",
                    null,
                    oldRec,
                    saveData,
                    _id
                );
                return res.json(__requestResponse("200", __SUCCESS, updated));
            }
        } catch (error) {
            console.error(error);
            return res.json(__requestResponse("500", __SOME_ERROR, error));
        }
    }
);

// List City Contacts with optional filter & pagination
router.post("/CityContactList", async (req, res) => {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
            CityId,
            ContactTypeId,
        } = req.body;
        const pageInt = parseInt(page);
        const limitInt = parseInt(limit);
        const skip = (pageInt - 1) * limitInt;

        const filter = {};
        if (search) {
            filter.ContactName = { $regex: search, $options: "i" };
        }
        if (CityId) filter.CityId = CityId;
        if (ContactTypeId) filter.ContactTypeId = ContactTypeId;

        const total = await CityContactMaster.countDocuments(filter);
        const list = await CityContactMaster.find(filter)
            .populate("CityId", "lookup_value")
            .populate("ContactTypeId", "lookup_value")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitInt)
            .lean();

        return res.json(
            __requestResponse("200", __SUCCESS, {
                total,
                page: pageInt,
                limit: limitInt,
                list: __deepClone(list),
            })
        );
    } catch (error) {
        console.error(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

module.exports = router;
