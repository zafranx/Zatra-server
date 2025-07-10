const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");

const tlbAssetMaster = require("../../../models/AssetMaster");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const moment = require("moment");
  APIEndPointNo = "#KCC0004";

  // Helper to fetch AssetTypeID dynamically from AdminEnvSetting
  const getAssetTypeID = async (envSettingCode) => {
    const assetType = await AdminEnvSetting.findOne({
      EnvSettingCode: envSettingCode,
    });
    console.log(
      `[getAssetTypeID] Fetching AssetTypeID for ${envSettingCode}:`,
      assetType
    );
    return assetType?.EnvSettingValue || null;
  };

  // In use
  router.post("/GetAssetReport", async (req, res) => {
    APIEndPointNo = "#KCC0004";

    try {
      const { startDate, endDate, filterType } = req.body;
      console.log("[API Call] Request body:", req.body);

      // Set date ranges for filters
      const today = moment().startOf("day");
      let currentPeriod = {};
      let previousPeriod = {};

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "day").toDate(),
            $lt: today.toDate(),
          };
          break;

        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "week").startOf("isoWeek").toDate(),
            $lt: moment(today).subtract(1, "week").endOf("isoWeek").toDate(),
          };
          break;

        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "month").startOf("month").toDate(),
            $lt: moment(today).subtract(1, "month").endOf("month").toDate(),
          };
          break;

        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "year").startOf("year").toDate(),
            $lt: moment(today).subtract(1, "year").endOf("year").toDate(),
          };
          break;

        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({
              status: "400",
              message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(endDate - startDate, "ms")
              .toDate(),
            $lt: new Date(startDate),
          };
          break;

        case "all_time":
          currentPeriod = {}; // No filter for all-time
          previousPeriod = {}; // No previous period for all-time
          break;

        default:
          return res
            .status(400)
            .json({ status: "400", message: "Invalid filter type." });
      }

      console.log("[Filter] Periods:", { currentPeriod, previousPeriod });

      // Fetch asset type mappings
      const assetTypeKeys = [
        "ASSET_TYPE_CLIENT",
        "ASSET_TYPE_CLIENT_USER",
        "ASSET_TYPE_HOSPITAL",
        "ASSET_TYPE_DOCTOR",
        "ASSET_TYPE_ATTENDANT",
        "ASSET_TYPE_PHARMACY",
        "ASSET_TYPE_PATHOLOGY",
        // "ASSET_TYPE_CARE_PARTNER",
      ];
      const assetTypeNames = [
        "Client(s)",
        "Client User(s)", // use space after Client -- Client Users
        "Hospital(s)",
        "Doctor(s)",
        "Attendant(s)",
        "Pharmacy(s)",
        "Pathology(s)",
        // "CarePartners",
      ];

      const assetTypeIDs = await Promise.all(
        assetTypeKeys.map((key) => getAssetTypeID(key))
      );

      if (!assetTypeIDs.every(Boolean)) {
        return res.status(500).json({
          status: "500",
          message: "Failed to fetch all AssetTypeIDs.",
        });
      }

      console.log("[Step] AssetTypeIDs fetched:", assetTypeIDs);

      // Fetch counts
      const countsResult = await tlbAssetMaster.aggregate([
        {
          $facet: {
            currentCounts: [
              {
                $match: {
                  ...(filterType !== "all_time" && {
                    createdAt: currentPeriod,
                  }),
                  AssetTypeID: {
                    $in: assetTypeIDs.map((id) => mongoose.Types.ObjectId(id)),
                  },
                },
              },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
            ...(filterType !== "all_time" && {
              previousCounts: [
                {
                  $match: {
                    createdAt: previousPeriod,
                    AssetTypeID: {
                      $in: assetTypeIDs.map((id) =>
                        mongoose.Types.ObjectId(id)
                      ),
                    },
                  },
                },
                { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
              ],
            }),
          },
        },
      ]);

      const currentCounts = countsResult[0].currentCounts;
      const previousCounts =
        filterType === "all_time" ? [] : countsResult[0].previousCounts;

      const counts = {};
      const percentChanges = {};

      for (let i = 0; i < assetTypeNames.length; i++) {
        const typeName = assetTypeNames[i];
        const typeID = assetTypeIDs[i];

        const currentCount = currentCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };
        const previousCount = previousCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };

        const percentChange =
          filterType === "all_time" || previousCount.count === 0
            ? 0
            : ((currentCount.count - previousCount.count) /
                previousCount.count) *
              100;

        counts[typeName] = {
          current: currentCount.count,
          previous: filterType === "all_time" ? null : previousCount.count,
        };
        percentChanges[typeName] =
          filterType === "all_time" ? null : percentChange.toFixed(2);
      }

      console.log("[Result] Counts:", counts);
      console.log("[Result] Percent changes:", percentChanges);
      // res.status(200).json({
      //   status: "200",
      //   message: "Counts fetched successfully.",
      //   counts,
      //   percentChanges,
      // });
      return res.json(
        __requestResponse(
          "200",
          __SUCCESS,
          (data = {
            message: "Counts fetched successfully.",
            counts,
            percentChanges,
          })
        )
      );
    } catch (error) {
      // console.error("[Error] Internal server error:", error);
      // res.status(500).json({
      //   status: "500",
      //   message: "Internal server error.",
      //   error: error.message,
      // });

      console.error(error, "error");
      return (
        res
          // .status(400)
          .json(
            __requestResponse(
              "400",
              __SOME_ERROR,
              `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
            )
          )
      );
    }
  });

  // Not in use
  router.post("/GetAssetCounts_test", async (req, res) => {
    try {
      const { startDate, endDate, filterType } = req.body;
      console.log("[API Call] Request body:", req.body);

      const today = moment().startOf("day");
      let currentPeriod = {};
      let previousPeriod = {};

      switch (filterType) {
        case "custom":
          if (!startDate || !endDate) {
            console.error("[Error] Missing custom startDate or endDate.");
            return res.status(400).json({
              status: "400",
              message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(moment(endDate).diff(moment(startDate), "ms"))
              .toDate(),
            $lt: new Date(startDate),
          };
          console.log("[Filter] Custom:", { currentPeriod, previousPeriod });
          break;

        // Add other cases here...

        default:
          console.error("[Error] Invalid filter type:", filterType);
          return res
            .status(400)
            .json({ status: "400", message: "Invalid filter type." });
      }

      const assetTypeKeys = [
        "ASSET_TYPE_CLIENT",
        "ASSET_TYPE_CLIENT_USER",
        "ASSET_TYPE_HOSPITAL",
        "ASSET_TYPE_DOCTOR",
        "ASSET_TYPE_ATTENDANT",
        "ASSET_TYPE_PHARMACY",
        "ASSET_TYPE_PATHOLOGY",
      ];

      const assetTypeNames = [
        "Clients",
        "ClientUsers",
        "Hospitals",
        "Doctors",
        "Attendants",
        "Pharmacies",
        "Pathologies",
      ];

      console.log("[Step] Fetching AssetTypeIDs...");
      const assetTypeIDs = await Promise.all(
        assetTypeKeys.map((key) => getAssetTypeID(key))
      );

      if (!assetTypeIDs.every(Boolean)) {
        console.error(
          "[Error] Failed to fetch all AssetTypeIDs:",
          assetTypeIDs
        );
        return res.status(500).json({
          status: "500",
          message: "Failed to fetch all AssetTypeIDs.",
        });
      }

      console.log("[Step] AssetTypeIDs fetched:", assetTypeIDs);

      console.log("[Step] Running aggregate query...");
      const countsResult = await tlbAssetMaster.aggregate([
        {
          $facet: {
            currentCounts: [
              {
                $match: {
                  createdAt: currentPeriod,
                  AssetTypeID: {
                    $in: assetTypeIDs.map((id) => mongoose.Types.ObjectId(id)),
                  },
                },
              },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
            previousCounts: [
              {
                $match: {
                  createdAt: previousPeriod,
                  AssetTypeID: {
                    $in: assetTypeIDs.map((id) => mongoose.Types.ObjectId(id)),
                  },
                },
              },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
          },
        },
      ]);

      console.log("[Step] Aggregate query result:", countsResult);

      const currentCounts = countsResult[0]?.currentCounts || [];
      const previousCounts = countsResult[0]?.previousCounts || [];

      const counts = {};
      const percentChanges = {};

      for (let i = 0; i < assetTypeNames.length; i++) {
        const typeName = assetTypeNames[i];
        const typeID = assetTypeIDs[i];

        const currentCount = currentCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };
        const previousCount = previousCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };

        const percentChange =
          previousCount.count === 0
            ? currentCount.count > 0
              ? 100
              : 0
            : ((currentCount.count - previousCount.count) /
                previousCount.count) *
              100;

        counts[typeName] = {
          current: currentCount.count,
          previous: previousCount.count,
        };
        percentChanges[typeName] = percentChange.toFixed(2);
      }

      console.log("[Result] Counts:", counts);
      console.log("[Result] Percent changes:", percentChanges);

      res.status(200).json({
        status: "200",
        message: "Counts fetched successfully.",
        counts,
        percentChanges,
      });
    } catch (error) {
      console.error("[Error] Internal server error:", error);
      res.status(500).json({
        status: "500",
        message: "Internal server error.",
        error: error.message,
      });
    }
  });


  // Not in use
  router.post("/enrollments1", async (req, res) => {
    try {
      const { filterType, startDate, endDate, assetType } = req.body;
      console.log("[API Call] Request body:", req.body);

      // Initialize date ranges
      const today = moment().startOf("day");
      let currentPeriod = {};
      let previousPeriod = {};

      // Define filters
      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "day").toDate(),
            $lt: today.toDate(),
          };
          break;

        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "week").startOf("isoWeek").toDate(),
            $lt: moment(today).subtract(1, "week").endOf("isoWeek").toDate(),
          };
          break;

        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "month").startOf("month").toDate(),
            $lt: moment(today).subtract(1, "month").endOf("month").toDate(),
          };
          break;

        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "year").startOf("year").toDate(),
            $lt: moment(today).subtract(1, "year").endOf("year").toDate(),
          };
          break;

        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({
              response_code: "400",
              response_message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(endDate - startDate, "ms")
              .toDate(),
            $lt: new Date(startDate),
          };
          break;

        case "all_time":
          currentPeriod = {}; // No filter for all-time
          previousPeriod = {}; // No previous period for all-time
          break;

        default:
          return res.status(400).json({
            response_code: "400",
            response_message: "Invalid filter type.",
          });
      }

      console.log("[Filter] Periods:", { currentPeriod, previousPeriod });

      // Build the query
      const query = {};
      if (Object.keys(currentPeriod).length) {
        query.registeredAt = currentPeriod;
      }

      if (assetType) {
        const assetTypeID = await getAssetTypeID(assetType);
        if (!assetTypeID) {
          return res.status(400).json({
            response_code: "400",
            response_message: "Invalid asset type.",
          });
        }
        query.AssetTypeID = assetTypeID; // Use mapped AssetTypeID
      }

      // Fetch data from asset_masters
      const enrollments = await tlbAssetMaster.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "admin_lookups", // Lookup for asset types
            localField: "AssetTypeID",
            foreignField: "_id",
            as: "assetTypeDetails",
          },
        },
        {
          $lookup: {
            from: "address_master", // Lookup for addresses
            localField: "LocationID",
            foreignField: "_id",
            as: "locationDetails",
          },
        },
        {
          $project: {
            _id: 1,
            name: "$AssetName",
            type: { $arrayElemAt: ["$assetTypeDetails.lookup_value", 0] },
            location: { $arrayElemAt: ["$locationDetails.City", 0] },
            description: "$Description",
            registeredAt: 1,
          },
        },
      ]);

      // Format the response
      const response = enrollments.map((enrollment) => ({
        id: enrollment._id,
        name: enrollment.name,
        type: enrollment.type,
        location: enrollment.location,
        description: enrollment.description,
        registeredDate: moment(enrollment.registeredAt).format("MMMM Do YYYY"), // Format as date
        elapsedTime: moment(enrollment.registeredAt).fromNow(), // Show elapsed time
      }));

      // // Send the response
      // res.status(200).json({
      //   response_code: "200",
      //   response_message: "Enrollments fetched successfully",
      //   data: response,
      // });
      __requestResponse(
        "200",
        __SUCCESS,
        (data = {
          message: "Enrollments fetched successfully.",
          response,
        })
      );
    } catch (error) {
      console.error("Error fetching filtered enrollments:", error);
      res.status(500).json({
        response_code: "500",
        response_message: "Internal Server Error",
      });
    }
  });

  // In use
  router.post("/enrollments", async (req, res) => {
    try {
      const { filterType, startDate, endDate, assetType } = req.body;
      console.log("[API Call] Request body:", req.body);

      // Initialize date ranges
      const today = moment().startOf("day");
      let currentPeriod = {};

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          break;

        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          break;

        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          break;

        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          break;

        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({
              response_code: "400",
              response_message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          break;

        case "all_time":
          currentPeriod = {}; // No filter for all-time
          break;

        default:
          return res.status(400).json({
            response_code: "400",
            response_message: "Invalid filter type.",
          });
      }

      console.log("[Filter] Current Period:", currentPeriod);

      // Fetch AssetTypeID using the provided asset type
      const assetTypeID = assetType ? await getAssetTypeID(assetType) : null;

      // Query for asset masters
      const query = {
        ...(Object.keys(currentPeriod).length && { createdAt: currentPeriod }),
        ...(assetTypeID && {
          AssetTypeID: mongoose.Types.ObjectId(assetTypeID),
        }),
      };

      const enrollments = await tlbAssetMaster.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "admin_lookups", // Fetch asset type details
            localField: "AssetTypeID",
            foreignField: "_id",
            as: "assetTypeDetails",
          },
        },
        {
          $lookup: {
            from: "asset_masters", // Fetch asset details
            localField: "AssetTypeID",
            foreignField: "AssetTypeID",
            as: "assetDetails",
          },
        },
        {
          $lookup: {
            from: "address_master", // fetch location details
            localField: "LocationID",
            foreignField: "_id",
            as: "locationDetails",
          },
        },
        {
          $project: {
            _id: 1,
            name: "$AssetName",
            type: { $arrayElemAt: ["$assetTypeDetails.lookup_value", 0] },
            location: { $arrayElemAt: ["$locationDetails.City", 0] },
            description: "$Description",
            registeredAt: 1,
            createdAt: 1,
            // timeAgo2: {
            //   $let: {
            //     vars: { now: new Date() },
            //     in: {
            //       $concat: [
            //         {
            //           $substr: [
            //             {
            //               $divide: [
            //                 { $subtract: ["$$now", "$createdAt"] },
            //                 1000 * 60 * 60 * 24,
            //               ],
            //             },
            //             0,
            //             -1,
            //           ],
            //         },
            //         " days ago",
            //       ],
            //     },
            //   },
            // },
            // assetDetails: "$assetDetails",
          },
        },
        { $sort: { createdAt: -1 } }, // Sort by registeredAt descending
      ]);
      // console.log(enrollments, "enrollment");
      // Format response with time ago and additional details
      const response = enrollments.map((enrollment) => {
        const timeAgo = moment(enrollment.createdAt).fromNow();
        const formattedDate = moment(enrollment.createdAt).isBefore(
          moment().subtract(1, "day")
        )
          ? moment(enrollment.createdAt).format("YYYY-MM-DD")
          : timeAgo;

        return {
          id: enrollment._id,
          name: enrollment.name || "N/A",
          type: enrollment.type || "Unknown",
          description: enrollment.description || "No description provided",
          registeredAt: formattedDate,
          // timeAgo: enrollment.timeAgo,
          timeAgo: timeAgo,
          assetDetails: enrollment.assetDetails,
          // locationDetails: enrollment.locationDetails,
        };
      });

      // Return the response
      // res.status(200).json({
      //   response_code: "200",
      //   response_message: "Enrollments fetched successfully",
      //   data: response,
      // });
      return res.json(
        __requestResponse("200", "Enrollments fetched successfully", response)
      );
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({
        response_code: "500",
        response_message: "Internal Server Error",
      });
    }
  });

  router.post("/enrollments_new", async (req, res) => {
    try {
      const {
        filterType,
        startDate,
        endDate,
        assetType,
        page = 1,
        pageSize = 20,
      } = req.body;
      console.log("[API Call] Request body:", req.body);

      // Initialize date ranges
      const today = moment().startOf("day");
      let currentPeriod = {};

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          break;

        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          break;

        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          break;

        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          break;

        case "custom":
          if (!startDate || !endDate) {
            return res.json(
              __requestResponse(
                "400",
                "Start date and end date are required for custom filter."
              )
            );
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          break;

        case "all_time":
          currentPeriod = {}; // No filter for all-time
          break;

        default:
          return res.json(__requestResponse("400", "Invalid filter type."));
      }

      console.log("[Filter] Current Period:", currentPeriod);

      // Fetch AssetTypeID using the provided asset type
      const assetTypeID = assetType ? await getAssetTypeID(assetType) : null;

      // Query for asset masters
      const query = {
        ...(Object.keys(currentPeriod).length && { createdAt: currentPeriod }),
        ...(assetTypeID && {
          AssetTypeID: mongoose.Types.ObjectId(assetTypeID),
        }),
      };

      // Calculate pagination parameters
      const skip = (page - 1) * pageSize;
      const limit = parseInt(pageSize, 10);

      // Fetch enrollments with paging
      const enrollments = await tlbAssetMaster.aggregate([
        { $match: query },
        {
          $lookup: {
            from: "admin_lookups", // Fetch asset type details
            localField: "AssetTypeID",
            foreignField: "_id",
            as: "assetTypeDetails",
          },
        },
        {
          $lookup: {
            from: "address_master", // Fetch location details
            localField: "LocationID",
            foreignField: "_id",
            as: "locationDetails",
          },
        },
        {
          $project: {
            _id: 1,
            name: "$AssetName",
            type: { $arrayElemAt: ["$assetTypeDetails.lookup_value", 0] },
            location: { $arrayElemAt: ["$locationDetails.City", 0] },
            description: "$Description",
            registeredAt: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } }, // Sort by registeredAt descending
        { $skip: skip }, // Skip records for paging
        { $limit: limit }, // Limit the number of records per page
      ]);

      // Format response with time ago and additional details
      const responseData = enrollments.map((enrollment) => {
        const timeAgo = moment(enrollment.createdAt).fromNow();
        const formattedDate = moment(enrollment.createdAt).isBefore(
          moment().subtract(1, "day")
        )
          ? moment(enrollment.createdAt).format("YYYY-MM-DD")
          : timeAgo;

        return {
          id: enrollment._id,
          name: enrollment.name || "N/A",
          type: enrollment.type || "Unknown",
          description: enrollment.description || "No description provided",
          registeredAt: formattedDate,
          timeAgo,
          location: enrollment.location || "Unknown",
        };
      });

      // Total record count for pagination metadata
      const totalRecords = await tlbAssetMaster.countDocuments(query);

      // Combine data and pagination into response
      const response = {
        data: responseData,
        pagination: {
          totalRecords,
          page: parseInt(page, 10),
          pageSize: parseInt(pageSize, 10),
          totalPages: Math.ceil(totalRecords / pageSize),
        },
      };

      // Return the response in the specified format
      return res.json(
        __requestResponse("200", "Enrollments fetched successfully", response)
      );
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      return res.json(
        __requestResponse(
          "500",
          "An error occurred while fetching enrollments."
        )
      );
    }
  });

router.post("/enrollments_graph", async (req, res) => {
  try {
    const { filterType, startDate, endDate, assetType } = req.body;

    const today = moment().startOf("day");
    let currentPeriod = {};

    switch (filterType) {
      case "daily":
        currentPeriod = {
          $gte: today.toDate(),
          $lt: moment(today).endOf("day").toDate(),
        };
        break;
      case "weekly":
        currentPeriod = {
          $gte: moment(today).startOf("isoWeek").toDate(),
          $lt: moment(today).endOf("isoWeek").toDate(),
        };
        break;
      case "monthly":
        currentPeriod = {
          $gte: moment(today).startOf("month").toDate(),
          $lt: moment(today).endOf("month").toDate(),
        };
        break;
      case "yearly":
        currentPeriod = {
          $gte: moment(today).startOf("year").toDate(),
          $lt: moment(today).endOf("year").toDate(),
        };
        break;
      case "custom":
        if (!startDate || !endDate) {
          return res.json(
            __requestResponse(
              "400",
              "Start date and end date are required for custom filter."
            )
          );
        }
        currentPeriod = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
        break;
      case "all_time":
        currentPeriod = {}; // No filter for all-time
        break;
      default:
        return res.json(__requestResponse("400", "Invalid filter type."));
    }

    const assetTypeID = assetType ? await getAssetTypeID(assetType) : null;

    const query = {
      ...(Object.keys(currentPeriod).length && { createdAt: currentPeriod }),
      ...(assetTypeID && { AssetTypeID: mongoose.Types.ObjectId(assetTypeID) }),
    };

    // Aggregate data for graph
    const enrollments = await tlbAssetMaster.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            assetType: "$AssetTypeID",
          },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "admin_lookups",
          localField: "_id.assetType",
          foreignField: "_id",
          as: "assetTypeDetails",
        },
      },
      {
        $project: {
          date: "$_id.date",
          assetType: { $arrayElemAt: ["$assetTypeDetails.lookup_value", 0] },
          count: 1,
        },
      },
      { $sort: { date: 1 } }, // Sort by date
    ]);

    return res.json(
      __requestResponse("200", "Graph data fetched successfully", enrollments)
    );
  } catch (error) {
    console.error("Error fetching enrollments graph data:", error);
    return res.json(
      __requestResponse("500", "An error occurred while fetching graph data.")
    );
  }
});




  

// ----------------------------------------------------------------------------------------------------------------//
// Not in use
  router.get("/GetAssetCounts_not_use", async (req, res) => {
    try {
      const { startDate, endDate, filterType } = req.body;

      // Define filter type: "daily", "weekly", "monthly", "yearly", or "custom"
      let currentPeriod = {};
      let previousPeriod = {};

      const today = moment().startOf("day");

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "day").toDate(),
            $lt: today.toDate(),
          };
          break;

        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "week").startOf("isoWeek").toDate(),
            $lt: moment(today).subtract(1, "week").endOf("isoWeek").toDate(),
          };
          break;

        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "month").startOf("month").toDate(),
            $lt: moment(today).subtract(1, "month").endOf("month").toDate(),
          };
          break;

        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "year").startOf("year").toDate(),
            $lt: moment(today).subtract(1, "year").endOf("year").toDate(),
          };
          break;

        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({
              status: "400",
              message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(endDate - startDate, "ms")
              .toDate(),
            $lte: new Date(startDate),
          };
          break;

        default:
          currentPeriod = {}; // Default: all-time data
          previousPeriod = {};
          break;
      }

      // Fetch all asset type IDs dynamically
      const assetTypeKeys = [
        "ASSET_TYPE_CLIENT",
        "ASSET_TYPE_CLIENT_USER",
        "ASSET_TYPE_HOSPITAL",
        "ASSET_TYPE_DOCTOR",
        "ASSET_TYPE_ATTENDANT",
        "ASSET_TYPE_PHARMACY",
        "ASSET_TYPE_PATHOLOGY",
        "ASSET_TYPE_CARE_PARTNER",
      ];

      const assetTypeIDs = await Promise.all(
        assetTypeKeys.map((key) => getAssetTypeID(key))
      );

      const assetTypeNames = [
        "Clients",
        "ClientUsers",
        "Hospitals",
        "Doctors",
        "Attendants",
        "Pharmacies",
        "Pathologies",
        "CarePartners",
      ];

      // Count results
      const counts = {};
      for (let i = 0; i < assetTypeNames.length; i++) {
        const typeName = assetTypeNames[i];
        const typeID = assetTypeIDs[i];

        if (!typeID) {
          counts[typeName] = { current: 0, previous: 0, percentChange: 0 };
          continue;
        }

        const currentCount = await tlbAssetMaster.countDocuments({
          AssetTypeID: mongoose.Types.ObjectId(typeID),
          CreatedAt: currentPeriod,
        });

        const previousCount = await tlbAssetMaster.countDocuments({
          AssetTypeID: mongoose.Types.ObjectId(typeID),
          CreatedAt: previousPeriod,
        });

        const percentChange =
          previousCount === 0
            ? currentCount > 0
              ? 100
              : 0
            : ((currentCount - previousCount) / previousCount) * 100;

        counts[typeName] = {
          current: currentCount,
          previous: previousCount,
          percentChange: percentChange.toFixed(2),
        };
      }

      res.status(200).json({
        status: "200",
        message: "Counts fetched successfully.",
        data: counts,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "500",
        message: "Internal server error.",
        error: error.message,
      });
    }
  });

// Not in use
  router.get("/GetAssetCounts2", async (req, res) => {
    try {
      const { startDate, endDate, filterType } = req.body;

      // Define filter periods
      let currentPeriod = {};
      let previousPeriod = {};
      const today = moment().startOf("day");

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "day").toDate(),
            $lt: today.toDate(),
          };
          break;

        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "week").startOf("isoWeek").toDate(),
            $lt: moment(today).subtract(1, "week").endOf("isoWeek").toDate(),
          };
          break;

        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "month").startOf("month").toDate(),
            $lt: moment(today).subtract(1, "month").endOf("month").toDate(),
          };
          break;

        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "year").startOf("year").toDate(),
            $lt: moment(today).subtract(1, "year").endOf("year").toDate(),
          };
          break;

        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({
              status: "400",
              message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(endDate - startDate, "ms")
              .toDate(),
            $lte: new Date(startDate),
          };
          break;

        default:
          currentPeriod = {}; // Default: all-time data
          previousPeriod = {};
          break;
      }

      // Fetch Asset Type IDs
      const assetTypeKeys = [
        "ASSET_TYPE_CLIENT",
        "ASSET_TYPE_CLIENT_USER",
        "ASSET_TYPE_HOSPITAL",
        "ASSET_TYPE_DOCTOR",
        "ASSET_TYPE_ATTENDANT",
        "ASSET_TYPE_PHARMACY",
        "ASSET_TYPE_PATHOLOGY",
        "ASSET_TYPE_CARE_PARTNER",
      ];

      const assetTypeIDs = await Promise.all(
        assetTypeKeys.map((key) => getAssetTypeID(key))
      );

      const assetTypeNames = [
        "Clients",
        "ClientUsers",
        "Hospitals",
        "Doctors",
        "Attendants",
        "Pharmacies",
        "Pathologies",
        "CarePartners",
      ];

      // Optimized MongoDB Aggregation Query
      const allCounts = await tlbAssetMaster.aggregate([
        {
          $facet: {
            currentPeriod: [
              { $match: { CreatedAt: currentPeriod } },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
            previousPeriod: [
              { $match: { CreatedAt: previousPeriod } },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
          },
        },
      ]);

      const currentCounts = allCounts[0]?.currentPeriod || [];
      const previousCounts = allCounts[0]?.previousPeriod || [];

      // Process results
      const counts = {};
      const percentChanges = {};

      assetTypeNames.forEach((name, index) => {
        const typeID = assetTypeIDs[index];
        const currentCount =
          currentCounts.find((c) => c._id.equals(typeID))?.count || 0;
        const previousCount =
          previousCounts.find((p) => p._id.equals(typeID))?.count || 0;

        const percentChange =
          previousCount === 0
            ? currentCount > 0
              ? 100
              : 0
            : ((currentCount - previousCount) / previousCount) * 100;

        counts[name] = {
          current: currentCount,
          previous: previousCount,
        };
        percentChanges[name] = percentChange.toFixed(2);
      });

      res.status(200).json({
        status: "200",
        message: "Counts fetched successfully.",
        counts,
        percentChanges,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "500",
        message: "Internal server error.",
        error: error.message,
      });
    }
  });

// Not in use
  router.post("/GetAssetCounts3", async (req, res) => {
    try {
      const { startDate, endDate, filterType } = req.body;
      console.log(req.body, "body");
      // Define date filters
      const today = moment().startOf("day");
      let currentPeriod = {};
      let previousPeriod = {};

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "day").toDate(),
            $lt: today.toDate(),
          };
          break;
        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "week").startOf("isoWeek").toDate(),
            $lt: moment(today).subtract(1, "week").endOf("isoWeek").toDate(),
          };
          break;
        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "month").startOf("month").toDate(),
            $lt: moment(today).subtract(1, "month").endOf("month").toDate(),
          };
          break;
        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "year").startOf("year").toDate(),
            $lt: moment(today).subtract(1, "year").endOf("year").toDate(),
          };
          break;
        case "custom":
          if (!startDate || !endDate) {
            return res.status(400).json({
              status: "400",
              message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(endDate - startDate, "ms")
              .toDate(),
            $lt: new Date(startDate),
          };
          break;
        default:
          return res
            .status(400)
            .json({ status: "400", message: "Invalid filter type." });
      }

      // Asset Type Keys and Names
      const assetTypeKeys = [
        "ASSET_TYPE_CLIENT",
        "ASSET_TYPE_CLIENT_USER",
        "ASSET_TYPE_HOSPITAL",
        "ASSET_TYPE_DOCTOR",
        "ASSET_TYPE_ATTENDANT",
        "ASSET_TYPE_PHARMACY",
        "ASSET_TYPE_PATHOLOGY",
        // "ASSET_TYPE_CARE_PARTNER",
      ];

      const assetTypeNames = [
        "Clients",
        "ClientUsers",
        "Hospitals",
        "Doctors",
        "Attendants",
        "Pharmacies",
        "Pathologies",
        // "CarePartners",
      ];

      // Fetch Asset Type IDs
      const assetTypeIDs = await Promise.all(
        assetTypeKeys.map((key) => getAssetTypeID(key))
      );
      if (!assetTypeIDs.every(Boolean)) {
        return res.status(500).json({
          status: "500",
          message: "Failed to fetch all AssetTypeIDs.",
        });
      }

      // Optimize queries using $facet to fetch all counts in a single query
      const countsResult = await tlbAssetMaster.aggregate([
        {
          $facet: {
            currentCounts: [
              {
                $match: {
                  CreatedAt: currentPeriod,
                  AssetTypeID: {
                    $in: assetTypeIDs.map((id) => mongoose.Types.ObjectId(id)),
                  },
                },
              },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
            previousCounts: [
              {
                $match: {
                  CreatedAt: previousPeriod,
                  AssetTypeID: {
                    $in: assetTypeIDs.map((id) => mongoose.Types.ObjectId(id)),
                  },
                },
              },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
          },
        },
      ]);

      const [currentCounts, previousCounts] = [
        countsResult[0].currentCounts,
        countsResult[0].previousCounts,
      ];

      // Map counts to asset types
      const counts = {};
      const percentChanges = {};
      for (let i = 0; i < assetTypeNames.length; i++) {
        const typeName = assetTypeNames[i];
        const typeID = assetTypeIDs[i];

        const currentCount = currentCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };
        const previousCount = previousCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };

        const percentChange =
          previousCount.count === 0
            ? currentCount.count > 0
              ? 100
              : 0
            : ((currentCount.count - previousCount.count) /
                previousCount.count) *
              100;

        counts[typeName] = {
          current: currentCount.count,
          previous: previousCount.count,
        };
        percentChanges[typeName] = percentChange.toFixed(2);
      }

      res.status(200).json({
        status: "200",
        message: "Counts fetched successfully.",
        counts,
        percentChanges,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "500",
        message: "Internal server error.",
        error: error.message,
      });
    }
  });
// Not in use

  router.post("/GetAssetCounts4", async (req, res) => {
    try {
      const { startDate, endDate, filterType } = req.body;
      console.log("[API Call] Request body:", req.body);

      const today = moment().startOf("day");
      let currentPeriod = {};
      let previousPeriod = {};

      switch (filterType) {
        case "daily":
          currentPeriod = {
            $gte: today.toDate(),
            $lt: moment(today).endOf("day").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "day").toDate(),
            $lt: today.toDate(),
          };
          console.log("[Filter] Daily:", { currentPeriod, previousPeriod });
          break;
        case "weekly":
          currentPeriod = {
            $gte: moment(today).startOf("isoWeek").toDate(),
            $lt: moment(today).endOf("isoWeek").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "week").startOf("isoWeek").toDate(),
            $lt: moment(today).subtract(1, "week").endOf("isoWeek").toDate(),
          };
          console.log("[Filter] Weekly:", { currentPeriod, previousPeriod });
          break;
        case "monthly":
          currentPeriod = {
            $gte: moment(today).startOf("month").toDate(),
            $lt: moment(today).endOf("month").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "month").startOf("month").toDate(),
            $lt: moment(today).subtract(1, "month").endOf("month").toDate(),
          };
          console.log("[Filter] Monthly:", { currentPeriod, previousPeriod });
          break;
        case "yearly":
          currentPeriod = {
            $gte: moment(today).startOf("year").toDate(),
            $lt: moment(today).endOf("year").toDate(),
          };
          previousPeriod = {
            $gte: moment(today).subtract(1, "year").startOf("year").toDate(),
            $lt: moment(today).subtract(1, "year").endOf("year").toDate(),
          };
          console.log("[Filter] Yearly:", { currentPeriod, previousPeriod });
          break;
        case "custom":
          if (!startDate || !endDate) {
            console.error("[Error] Missing custom startDate or endDate.");
            return res.status(400).json({
              status: "400",
              message:
                "Start date and end date are required for custom filter.",
            });
          }
          currentPeriod = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          };
          previousPeriod = {
            $gte: moment(new Date(startDate))
              .subtract(endDate - startDate, "ms")
              .toDate(),
            $lt: new Date(startDate),
          };
          console.log("[Filter] Custom:", { currentPeriod, previousPeriod });
          break;
        case "all_time":
          currentPeriod = {}; // Match all documents
          previousPeriod = {}; // No previous period for all time
          console.log("[Filter] All Time:", { currentPeriod, previousPeriod });
          break;
        default:
          console.error("[Error] Invalid filter type:", filterType);
          return res
            .status(400)
            .json({ status: "400", message: "Invalid filter type." });
      }

      const assetTypeKeys = [
        "ASSET_TYPE_CLIENT",
        "ASSET_TYPE_CLIENT_USER",
        "ASSET_TYPE_HOSPITAL",
        "ASSET_TYPE_DOCTOR",
        "ASSET_TYPE_ATTENDANT",
        "ASSET_TYPE_PHARMACY",
        "ASSET_TYPE_PATHOLOGY",
      ];

      const assetTypeNames = [
        "Clients",
        "ClientUsers",
        "Hospitals",
        "Doctors",
        "Attendants",
        "Pharmacies",
        "Pathologies",
      ];

      console.log("[Step] Fetching AssetTypeIDs...");
      const assetTypeIDs = await Promise.all(
        assetTypeKeys.map((key) => getAssetTypeID(key))
      );

      console.log("[Step] AssetTypeIDs fetched:", assetTypeIDs);

      if (!assetTypeIDs.every(Boolean)) {
        console.error(
          "[Error] Failed to fetch all AssetTypeIDs:",
          assetTypeIDs
        );
        return res.status(500).json({
          status: "500",
          message: "Failed to fetch all AssetTypeIDs.",
        });
      }

      console.log("[Step] Running aggregate query...");
      const countsResult = await tlbAssetMaster.aggregate([
        {
          $facet: {
            currentCounts: [
              {
                $match: {
                  ...(filterType !== "all_time" && {
                    CreatedAt: currentPeriod,
                  }),
                  AssetTypeID: {
                    $in: assetTypeIDs.map((id) => mongoose.Types.ObjectId(id)),
                  },
                },
              },
              { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
            ],
            ...(filterType !== "all_time" && {
              previousCounts: [
                {
                  $match: {
                    CreatedAt: previousPeriod,
                    AssetTypeID: {
                      $in: assetTypeIDs.map((id) =>
                        mongoose.Types.ObjectId(id)
                      ),
                    },
                  },
                },
                { $group: { _id: "$AssetTypeID", count: { $sum: 1 } } },
              ],
            }),
          },
        },
      ]);

      console.log("[Step] Aggregate query result:", countsResult);

      const currentCounts = countsResult[0].currentCounts;
      const previousCounts =
        filterType === "all_time" ? [] : countsResult[0].previousCounts;

      const counts = {};
      const percentChanges = {};

      for (let i = 0; i < assetTypeNames.length; i++) {
        const typeName = assetTypeNames[i];
        const typeID = assetTypeIDs[i];

        const currentCount = currentCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };
        const previousCount = previousCounts.find(
          (c) => c._id.toString() === typeID
        ) || { count: 0 };

        const percentChange =
          filterType === "all_time" || previousCount.count === 0
            ? 0
            : ((currentCount.count - previousCount.count) /
                previousCount.count) *
              100;

        counts[typeName] = {
          current: currentCount.count,
          previous: filterType === "all_time" ? null : previousCount.count,
        };
        percentChanges[typeName] =
          filterType === "all_time" ? null : percentChange.toFixed(2);
      }

      console.log("[Result] Final counts:", counts);
      console.log("[Result] Percent changes:", percentChanges);

      res.status(200).json({
        status: "200",
        message: "Counts fetched successfully.",
        counts,
        percentChanges,
      });
    } catch (error) {
      console.error("[Error] Internal server error:", error);
      res.status(500).json({
        status: "500",
        message: "Internal server error.",
        error: error.message,
      });
    }
  });

// router.get("/dashboardcount", async (req, res) => {
//   try {
//     const { period, customStartDate, customEndDate } = req.body;

//     // Determine the date range
//     const now = new Date();
//     let startDate, endDate, previousStartDate, previousEndDate;

//     switch (period) {
//       case "daily":
//         startDate = new Date(now.setHours(0, 0, 0, 0));
//         endDate = new Date(now.setHours(23, 59, 59, 999));
//         previousStartDate = new Date(startDate);
//         previousStartDate.setDate(previousStartDate.getDate() - 1);
//         previousEndDate = new Date(endDate);
//         previousEndDate.setDate(previousEndDate.getDate() - 1);
//         break;
//       case "weekly":
//         startDate = new Date(now);
//         startDate.setDate(now.getDate() - now.getDay()); // Start of the week
//         endDate = new Date(startDate);
//         endDate.setDate(startDate.getDate() + 6);
//         previousStartDate = new Date(startDate);
//         previousStartDate.setDate(previousStartDate.getDate() - 7);
//         previousEndDate = new Date(endDate);
//         previousEndDate.setDate(previousEndDate.getDate() - 7);
//         break;
//       case "monthly":
//         startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//         endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
//         previousStartDate = new Date(startDate);
//         previousStartDate.setMonth(previousStartDate.getMonth() - 1);
//         previousEndDate = new Date(endDate);
//         previousEndDate.setMonth(previousEndDate.getMonth() - 1);
//         break;
//       case "yearly":
//         startDate = new Date(now.getFullYear(), 0, 1);
//         endDate = new Date(now.getFullYear(), 11, 31);
//         previousStartDate = new Date(startDate);
//         previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
//         previousEndDate = new Date(endDate);
//         previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
//         break;
//       case "custom":
//         if (!customStartDate || !customEndDate) {
//           return res.status(400).json({ error: "Custom dates are required." });
//         }
//         startDate = new Date(customStartDate);
//         endDate = new Date(customEndDate);
//         const diff = endDate - startDate;
//         previousStartDate = new Date(startDate.getTime() - diff);
//         previousEndDate = new Date(endDate.getTime() - diff);
//         break;
//       default:
//         startDate = null;
//         endDate = null;
//     }

//     // Define AssetTypeIDs for each category
//     const assetTypeMapping = {
//       Clients: "66c5d5866f7019999e510f6b",
//       ClientUsers: "66d93c526041daaabccc02ab",
//       Hospitals: "66d93c526041daaabccc02ac",
//       Doctors: "66d93c526041daaabccc02ad",
//       Attendants: "66d93c526041daaabccc02ae",
//       Pharmacies: "66d93c526041daaabccc02af",
//       Pathologies: "66d93c526041daaabccc02b0",
//       CarePartners: "66d93c526041daaabccc02b1",
//     };

//     // Prepare counts for the current and previous periods
//     const data = {};
//     for (const [key, assetTypeID] of Object.entries(assetTypeMapping)) {
//       const currentCount = await AssetMaster.countDocuments({
//         AssetTypeID: assetTypeID,
//         ...(startDate && { createdAt: { $gte: startDate, $lte: endDate } }),
//       });

//       const previousCount = await AssetMaster.countDocuments({
//         AssetTypeID: assetTypeID,
//         ...(previousStartDate && {
//           createdAt: { $gte: previousStartDate, $lte: previousEndDate },
//         }),
//       });

//       const percentageChange =
//         previousCount === 0
//           ? currentCount > 0
//             ? 100
//             : 0
//           : ((currentCount - previousCount) / previousCount) * 100;

//       data[key] = {
//         current: currentCount,
//         previous: previousCount,
//         percentageChange: percentageChange.toFixed(2),
//       };
//     }

//     return res.status(200).json({ data });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// });

module.exports = router;
