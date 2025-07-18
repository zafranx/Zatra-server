// routes/cityContact.routes.js
const express = require("express");
const router = express.Router();
const CityContactMaster = require("../../../models/CityContactMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const HelplineMaster = require("../../../models/HelplineMaster");
const GovtPolicyMaster = require("../../../models/GovtPolicyMaster");

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

// List Helplines with pagination and search
router.post("/HelplineList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", CityId } = req.body;

    const filter = {};
    if (search) {
      filter.ContactPersonName = { $regex: search, $options: "i" };
    }
    if (CityId) {
      filter.CityId = CityId;
    }

    const total = await HelplineMaster.countDocuments(filter);
    const list = await HelplineMaster.find(filter)
      .populate("CityId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page,
        limit,
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// List GovtPolicy with pagination and search
router.post("/GovtPolicyList", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", CityId } = req.body;
    const filter = {};

    if (search) filter.PolicyTitle = { $regex: search, $options: "i" };
    if (CityId) filter.CityId = CityId;

    const total = await GovtPolicyMaster.countDocuments(filter);
    const list = await GovtPolicyMaster.find(filter)
      .populate("CityId", "lookup_value")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page,
        limit,
        list: __deepClone(list),
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

module.exports = router;
