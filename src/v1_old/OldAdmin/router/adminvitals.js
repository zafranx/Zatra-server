// const express = require("express");
// const router = express.Router();

// const { __SUCCESS, __SOME_ERROR } = require("../../../utils/variable");
// const {
//     __requestResponse,
//     __deepClone,
//     __formatDate,
// } = require("../../../utils/constent");
// const { __fetchToken } = require("../middleware/authentication");
// const { default: mongoose } = require("mongoose");
// const InvestigationsJson = require("../../../models/InvestigationsJson");
// const LookupModel = require("../../../models/lookupmodel");
// const ImageRepository = require("../../../models/ImageRepository");
// const AdminEnvSetting = require("../../../models/AdminEnvSetting");
// const {
//     __checkFieldsValidation,
//     __alertValidation,
// } = require("../middleware/vitalsmiddleware");
// const AssetsInvestigation = require("../../../models/AssetsInvestigation");
// const InvestigationCategoryMaping = require("../../../models/InvestigationCategoryMaping");

// router.get("/GetVitalsInvestigation", __fetchToken, async (req, res) => {
//     try {
//         const _invCategory = await LookupModel.find(
//             {
//                 lookup_type: "investigation_type",
//                 is_active: true,
//             },
//             "lookup_value"
//         );
//         const _abnormalKey = await LookupModel.find(
//             {
//                 lookup_type: "abnormal_key",
//                 is_active: true,
//             },
//             "lookup_value parent_lookup_id"
//         );
//         const __cloneAbnormalKey = __deepClone(_abnormalKey);
//         const _investigations = await InvestigationsJson.find({
//             IsActive: true,
//         }).populate({
//             path: "InvestigationID InvestigationCategoryID Banner",
//             select: "lookup_value ImageData",
//         });

//         console.log(_investigations);

//         const __ImagePathDetails = await AdminEnvSetting.findOne({
//             EnvSettingCode: "IMAGE_PATH",
//         });
//         return res.json(
//             __requestResponse("200", __SUCCESS, {
//                 InvestigationCategory: _invCategory,
//                 Investigations: __deepClone(_investigations).map((item) => ({
//                     ...item,
//                     ...(item?.Banner && {
//                         Banner:
//                             (process.env.NODE_ENV == "development"
//                                 ? process.env.LOCAL_IMAGE_URL
//                                 : __ImagePathDetails?.EnvSettingTextValue) +
//                             item?.Banner?.ImageData,
//                     }),
//                     ...(item?.JsonData?.InputFields?.abnormal_parameters && {
//                         AbnormalParameters: __cloneAbnormalKey
//                             ?.filter(
//                                 (key) =>
//                                     key?.parent_lookup_id ==
//                                     item.InvestigationID?._id
//                             )
//                             .map((key) => key.lookup_value),
//                     }),
//                 })),
//             })
//         );
//     } catch (error) {
//         console.log(error);
//         return res.json(__requestResponse("500", __SOME_ERROR, error));
//     }
// });

// router.post(
//     "/SaveVitalsInvestigation",
//     [__fetchToken, __checkFieldsValidation, __alertValidation],
//     async (req, res) => {
//         try {
//             const {
//                 InvestigationsJsonID,
//                 VisionHealth = {},
//                 AssetID,
//                 TestDate,
//                 TestTime,
//                 Value,
//                 InterpretationReport,
//                 Report,
//                 AbnormalKeys,
//             } = req.body;

//             const _invJsonID = mongoose.Types.ObjectId(InvestigationsJsonID);
//             const _assetID = mongoose.Types.ObjectId(AssetID);

//             if (!_invJsonID) {
//                 return res.json(__requestResponse("400", "Invalid Json Id"));
//             }
//             const _investigations = await InvestigationsJson.findById(
//                 _invJsonID
//             );

//             if (!_investigations) {
//                 return res.json(
//                     __requestResponse("404", "Investigations Json Not Found")
//                 );
//             }
//             await AssetsInvestigation.create({
//                 InvestigationJsonID: _invJsonID,
//                 AssetId: _assetID,
//                 JsonData: {
//                     TestDate: TestDate,
//                     TestTime,
//                     Value,
//                     ...VisionHealth,
//                     InterpretationReport,
//                     Report,
//                     AbnormalKeys,
//                 },
//             });

//             return res.json(__requestResponse("200", __SUCCESS));
//         } catch (error) {
//             console.log(error);
//             return res.json(__requestResponse("500", __SOME_ERROR, error));
//         }
//     }
// );

// router.post(
//     "/GetAssetsVitalsInvestigation",
//     [__fetchToken],
//     async (req, res) => {
//         try {
//             const { InvestigationsJsonID, AssetID } = req.body;
//             console.log({
//                 InvestigationsJsonID,
//                 AssetID,
//             });

//             const _invJsonID = mongoose.Types.ObjectId.isValid(
//                 InvestigationsJsonID
//             )
//                 ? mongoose.Types.ObjectId(InvestigationsJsonID)
//                 : null;
//             if (!_invJsonID) {
//                 return res.json(__requestResponse("400", "Invalid Json Id"));
//             }
//             const _assetID = mongoose.Types.ObjectId.isValid(AssetID)
//                 ? mongoose.Types.ObjectId(AssetID)
//                 : null;
//             if (!_assetID) {
//                 return res.json(__requestResponse("400", "Invalid User ID"));
//             }

//             const _investigations = await InvestigationsJson.findById(
//                 _invJsonID
//             );

//             if (!_investigations) {
//                 return res.json(
//                     __requestResponse("404", "Investigations Json Not Found")
//                 );
//             }

//             const { ListPlaceholder, ListChecks = [] } =
//                 __deepClone(_investigations)?.JsonData;

//             const listData = await AssetsInvestigation.find({
//                 InvestigationJsonID: _invJsonID,
//                 AssetId: _assetID,
//             })
//                 .sort({ createdAt: -1 })
//                 .limit(5);

//             const __ImagePathDetails = await AdminEnvSetting.findOne({
//                 EnvSettingCode: "IMAGE_PATH",
//             });

//             return res.json(
//                 __requestResponse("200", __SUCCESS, {
//                     ListPlaceholder: ListPlaceholder,
//                     listData: __deepClone(listData).map((item) => {
//                         return {
//                             DataList: ListPlaceholder.map(
//                                 ({
//                                     fieldName,
//                                     date_filter,
//                                     filter,
//                                     add_end,
//                                     pathUrl,
//                                     multi,
//                                     bpFilter,
//                                     bmiFilter,
//                                 }) => {
//                                     let defaultcolor = "#fff";
//                                     let value = item?.JsonData[fieldName] || "";

//                                     if (date_filter) {
//                                         value = __formatDate(
//                                             item?.JsonData[fieldName]
//                                         );
//                                     }

//                                     if (filter) {
//                                         if (bmiFilter) {
//                                             value = Number(
//                                                 item?.JsonData[
//                                                     fieldName
//                                                 ]?.split("\n")?.[0]
//                                             );
//                                         } else {
//                                             value = Number(
//                                                 item?.JsonData[fieldName]
//                                             );
//                                         }
//                                         for (let {
//                                             ge,
//                                             g,
//                                             le,
//                                             l,
//                                             color,
//                                         } of ListChecks) {
//                                             if (
//                                                 (ge ? value >= ge : true) &&
//                                                 (g ? value > g : true) &&
//                                                 (le ? le >= value : true) &&
//                                                 (l ? l > value : true)
//                                             ) {
//                                                 defaultcolor = color || "";
//                                                 break;
//                                             }
//                                         }
//                                         if (bmiFilter) {
//                                             value = item?.JsonData[fieldName];
//                                         }
//                                     }
//                                     if (pathUrl) {
//                                         value =
//                                             (process.env.NODE_ENV ==
//                                             "development"
//                                                 ? process.env.LOCAL_IMAGE_URL
//                                                 : __ImagePathDetails?.EnvSettingTextValue) +
//                                             item?.JsonData[fieldName];
//                                     }

//                                     if (add_end) {
//                                         value =
//                                             item?.JsonData[fieldName] +
//                                             " " +
//                                             add_end;
//                                     }
//                                     if (multi) {
//                                         defaultcolor =
//                                             item?.JsonData[fieldName]?.length >
//                                             0
//                                                 ? "#F44336"
//                                                 : "#4CAF50";
//                                     }

//                                     if (bpFilter) {
//                                         const splitValues = value
//                                             ? value.split("/")
//                                             : "";
//                                         if (splitValues) {
//                                             if (
//                                                 splitValues[0] <= 120 &&
//                                                 splitValues[1] <= 80
//                                             ) {
//                                                 defaultcolor = "#01DF01";
//                                             } else if (
//                                                 splitValues[0] <= 129 &&
//                                                 splitValues[0] > 120 &&
//                                                 splitValues[1] <= 80
//                                             ) {
//                                                 defaultcolor = "#F4FA58";
//                                             } else if (
//                                                 (splitValues[0] <= 139 &&
//                                                     splitValues[0] >= 130) ||
//                                                 (splitValues[1] <= 89 &&
//                                                     splitValues[1] > 80)
//                                             ) {
//                                                 defaultcolor = "#FAAC58";
//                                             } else if (
//                                                 (splitValues[0] >= 140 &&
//                                                     splitValues[0] < 180) ||
//                                                 (splitValues[1] >= 90 &&
//                                                     splitValues[1] < 120)
//                                             ) {
//                                                 defaultcolor = "#FF8000";
//                                             } else if (
//                                                 splitValues[0] > 180 ||
//                                                 splitValues[1] > 120
//                                             ) {
//                                                 defaultcolor = "#FF0000";
//                                             }
//                                         }
//                                     }
//                                     return {
//                                         color: defaultcolor,
//                                         value,
//                                         ...(pathUrl && { isImage: true }),
//                                         ...(multi && { isMulti: true }),
//                                     };
//                                 }
//                             ),
//                         };
//                     }),
//                 })
//             );
//         } catch (error) {
//             console.log(error);
//             return res.json(__requestResponse("500", __SOME_ERROR, error));
//         }
//     }
// );

// router.get("/GetVitalInvGroups", __fetchToken, async (req, res) => {
//     try {
//         const _invGroups = await InvestigationCategoryMaping.find().populate([
//             {
//                 path: "InvestigationsJsonIDs",
//                 populate: {
//                     path: "InvestigationID InvestigationCategoryID",
//                     select: "lookup_value",
//                 },
//             },
//             {
//                 path: "Icon",
//                 select: "ImageData",
//             },
//         ]);

//         const _abnormalKey = await LookupModel.find(
//             {
//                 lookup_type: "abnormal_key",
//                 is_active: true,
//             },
//             "lookup_value parent_lookup_id"
//         );
//         const __cloneAbnormalKey = __deepClone(_abnormalKey);

//         const __ImagePathDetails = await AdminEnvSetting.findOne({
//             EnvSettingCode: "IMAGE_PATH",
//         });

//         return res.json(
//             __requestResponse(
//                 "200",
//                 __SUCCESS,
//                 __deepClone(_invGroups).map((item) => ({
//                     ...item,
//                     InvestigationsJsonIDs: item.InvestigationsJsonIDs.map(
//                         (details) => ({
//                             ...details,
//                             ...(details?.JsonData?.InputFields
//                                 ?.abnormal_parameters && {
//                                 AbnormalParameters: __cloneAbnormalKey
//                                     ?.filter(
//                                         (key) =>
//                                             key?.parent_lookup_id ==
//                                             item.InvestigationID?._id
//                                     )
//                                     .map((key) => key.lookup_value),
//                             }),
//                         })
//                     ),
//                     ...(item.Icon && {
//                         Icon:
//                             (process.env.NODE_ENV == "development"
//                                 ? process.env.LOCAL_IMAGE_URL
//                                 : __ImagePathDetails?.EnvSettingTextValue) +
//                             item.Icon.ImageData,
//                     }),
//                 }))
//             )
//         );
//     } catch (error) {
//         console.log(error);
//         return res.json(__requestResponse("500", __SOME_ERROR, error));
//     }
// });

// module.exports = router;
