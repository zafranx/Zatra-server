// routes/cityContact.routes.js
const express = require("express");
const router = express.Router();
const CityContactMaster = require("../../../models/CityContactMaster");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
const HelplineMaster = require("../../../models/HelplineMaster");
const GovtPolicyMaster = require("../../../models/GovtPolicyMaster");
const ProjectMaster = require("../../../models/ProjectMaster");
const DestinationMaster = require("../../../models/DestinationMaster");
const DestinationAmenitiesMaster = require("../../../models/DestinationAmenitiesMaster");

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

// 🔹 List Projects (with pagination and optional filters) or Investment Opportunties
router.post("/listProjectsOrInvestmentOpportunities", async (req, res) => {
  try {
    const {
      CityId,
      ProjectType,
      ApprovalStatus,
      Amenities,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const parsedPage = Math.max(parseInt(page) || 1, 1);
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};

    if (CityId) filter.CityId = CityId;
    if (ProjectType) filter.ProjectType = ProjectType;
    if (ApprovalStatus) filter.ApprovalStatus = ApprovalStatus;
    if (Amenities && Array.isArray(Amenities) && Amenities.length > 0) {
      filter.Amenities = { $in: Amenities };
    }

    if (search) {
      filter.ProjectName = { $regex: search, $options: "i" };
    }

    const [data, total] = await Promise.all([
      ProjectMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("ProjectType", "lookup_value")
        .populate("AvailableSizes.Unit", "lookup_value")
        .populate("ApprovalStatus", "lookup_value")
        .populate("Amenities", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      ProjectMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        total,
        page: parsedPage,
        limit: parsedLimit,
        list: __deepClone(data),
      })
    );
  } catch (error) {
    console.error("❌ Error in listProjects:", error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// Destination List
// (City ID, Destination Type ID, Search, Page, Limit)
router.post("/DestinationList", async (req, res) => {
  try {
    const {
      CityId,
      DestinationTypeId,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (DestinationTypeId) filter.DestinationTypeId = DestinationTypeId;
    if (search) filter.Destination = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DestinationMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("DestinationTypeId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(data),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// DestinationAmenities List
// (City ID, DestinationID, AmenityID, Search, Page, Limit)
router.post("/DestinationAmenitiesList", async (req, res) => {
  try {
    const {
      CityId,
      DestinationId,
      AmenityTypeId,
      search,
      page = 1,
      limit = 10,
    } = req.body;

    const filter = {};
    if (CityId) filter.CityId = CityId;
    if (DestinationId) filter.DestinationId = DestinationId;
    if (AmenityTypeId) filter.AmenityTypeId = AmenityTypeId;
    if (search) filter.Amenity = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DestinationAmenitiesMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("DestinationId", "lookup_value")
        .populate("AmenityTypeId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      DestinationAmenitiesMaster.countDocuments(filter),
    ]);

    return res.json(
      __requestResponse("200", __SUCCESS, {
        list: __deepClone(data),
        total,
        page,
        limit,
      })
    );
  } catch (error) {
    console.error(error);
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
});


module.exports = router;
