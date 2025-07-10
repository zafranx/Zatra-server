const express = require("express");
const router = express.Router();

const {
    __SUCCESS,
    __SOME_ERROR,
    __DATA_404,
} = require("../../../utils/variable");
const {
    __requestResponse,
    __deepClone,
    __calculateDistance,
} = require("../../../utils/constent");
const AssetMaster = require("../../../models/AssetMaster");
const { __fetchToken } = require("../middleware/authentication");
const Favourites = require("../../../models/Favourites");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const LookupModel = require("../../../models/lookupmodel");
const { AddFavoriteAsset, GetENV } = require("../constant");
const { default: mongoose } = require("mongoose");
const ContractServiceMapping = require("../../../models/ContractServiceMapping");
const AssetMetaData = require("../../../models/AssetMetaData");
const AssetSpecialtyMapping = require("../../../models/AssetSpecialtyMapping");
const AddressMaster = require("../../../models/AddressMaster");

router.post("/GetAssetsDropDownList", __fetchToken, async (req, res) => {
    try {
        const { AssetName } = req.body;
        if (!AssetName || AssetName.length == 0) {
            return res.json(
                __requestResponse("400", "Please enter asset name")
            );
        }

        const populateData = new Array();
        const AssetTypeIDs = new Array();
        populateData.push({
            path: "AssetTypeID",
            select: "lookup_value",
        });

        if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
            const _AssetType = await AdminEnvSetting.findOne({
                EnvSettingCode: "ASSET_TYPE_DOCTOR",
            });
            if (!_AssetType) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)"
                    )
                );
            }
            AssetTypeIDs.push(_AssetType?.EnvSettingValue);
        }
        if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
            const _AssetType = await AdminEnvSetting.findOne({
                EnvSettingCode: "ASSET_TYPE_HOSPITAL",
            });
            if (!_AssetType) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
                    )
                );
            }
            AssetTypeIDs.push(_AssetType?.EnvSettingValue);
        }

        const list = await AssetMaster.find(
            { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
            "AssetName AssetCode AssetTypeID"
        ).populate(populateData);

        if (!list || list.length == 0) {
            return res.json(__requestResponse("404", __DATA_404));
        }

        return res.json(
            __requestResponse(
                "200",
                __SUCCESS,
                __deepClone(list)
                    .map((item) => ({
                        id: item?._id,
                        name: item?.AssetName,
                        AssetType: item?.AssetTypeID?.lookup_value,
                    }))
                    .reduce((result, item) => {
                        // Check if the AssetType already exists in the result object
                        if (!result[item.AssetType]) {
                            result[item.AssetType] = [];
                        }
                        // Add the current item to the appropriate AssetType group
                        result[item.AssetType].push(item);
                        return result;
                    }, {})
            )
        );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/GetAssetsList", __fetchToken, async (req, res) => {
    try {
        const { AssetName } = req.body;
        if (!AssetName || AssetName.length == 0) {
            return res.json(
                __requestResponse("400", "Please enter asset name")
            );
        }

        const populateData = new Array();
        const AssetTypeIDs = new Array();
        populateData.push({
            path: "AssetTypeID",
            select: "lookup_value",
        });

        if (AssetName.includes("ASSET_TYPE_DOCTOR")) {
            const _AssetType = await AdminEnvSetting.findOne({
                EnvSettingCode: "ASSET_TYPE_DOCTOR",
            });
            if (!_AssetType) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Invalid Asset Type Env (ASSET_TYPE_DOCTOR)"
                    )
                );
            }
            AssetTypeIDs.push(_AssetType?.EnvSettingValue);

            populateData.push({
                // path: "Doctor.Designation Doctor.Speciality",
                path: "Doctor.Designation",
                select: "lookup_value",
            });
            populateData.push({
                // path: "Doctor.Designation Doctor.Speciality",
                path: "Doctor.Hospital",
                select: "AssetName Hospital.ProfilePic",
            });
        }
        if (AssetName.includes("ASSET_TYPE_HOSPITAL")) {
            const _AssetType = await AdminEnvSetting.findOne({
                EnvSettingCode: "ASSET_TYPE_HOSPITAL",
            });
            if (!_AssetType) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Invalid Asset Type Env (ASSET_TYPE_HOSPITAL)"
                    )
                );
            }
            AssetTypeIDs.push(_AssetType?.EnvSettingValue);
            populateData.push({
                // path: "Hospital.MedicalSpeciality Hospital.State Hospital.City",
                path: "Hospital.MedicalSpeciality Hospital.HospitalType",
                select: "lookup_value",
            });
            populateData.push({
                path: "Hospital.LocationID",
                populate: {
                    path: "CountryId StateId CityId",
                    select: "lookup_value",
                },
            });
            populateData.push({
                path: "Hospital.DoctorID",
                select: "AssetName Doctor.IsStar Doctor.ProfilePic",

                // populate: {
                //     path: "CountryId StateId CityId",
                //     select: "lookup_value",
                // },
            });
        }

        const list = await AssetMaster.find(
            { AssetTypeID: { $in: AssetTypeIDs }, IsFavourite: false },
            "AssetName AssetCode AssetTypeID Doctor Hospital "
        ).populate(populateData);

        if (!list || list.length == 0) {
            return res.json(__requestResponse("404", __DATA_404));
        }

        const AssetIds = __deepClone(list).map((item) => item?._id);

        const metaData = await AssetMetaData.find({
            AssetId: { $in: AssetIds },
        });
        const specialtyMappingList = await AssetSpecialtyMapping.find({
            AssetId: { $in: AssetIds },
        }).populate({
            path: "SpecialtyId SubSpeciality SuperSpecialization",
            select: "lookup_value",
        });

        const __ImagePathDetails = await GetENV("IMAGE_PATH");
        const __GetFB = await GetENV("META_DATA_FACEBOOK");
        const __GetIG = await GetENV("META_DATA_INSTAGRAM");
        const __GetX = await GetENV("META_DATA_X");
        const __GetLD = await GetENV("META_DATA_LINKEDIN");
        const __GetYT = await GetENV("META_DATA_YOUTUBE");

        return res.json(
            __requestResponse(
                "200",
                __SUCCESS,
                __deepClone(list).map((item) => {
                    const metaList = __deepClone(metaData).filter(
                        (md) => md.AssetId == item?._id
                    );
                    const specialtydetails =
                        __deepClone(specialtyMappingList).find(
                            (sm) => sm.AssetId == item?._id
                        ) || null;
                    return {
                        _id: item?._id,
                        AssetName: item?.AssetName,
                        AssetCode: item?.AssetCode,
                        AssetTypeID: item?.AssetTypeID,
                        [item?.AssetTypeID?.lookup_value]: {
                            ...item[item?.AssetTypeID?.lookup_value],
                            ...(item[item?.AssetTypeID?.lookup_value]
                                ?.ProfilePic && {
                                ProfilePic:
                                    (process.env.NODE_ENV == "development"
                                        ? process.env.LOCAL_IMAGE_URL
                                        : __ImagePathDetails?.EnvSettingTextValue) +
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.ProfilePic,
                            }),
                            ...(item[item?.AssetTypeID?.lookup_value]
                                ?.Hospital &&
                                item[item?.AssetTypeID?.lookup_value]?.Hospital
                                    .length > 0 && {
                                    Hospital: item[
                                        item?.AssetTypeID?.lookup_value
                                    ]?.Hospital.map((hp) => ({
                                        _id: hp._id,
                                        AssetName: hp.AssetName,
                                        ProfilePic:
                                            (process.env.NODE_ENV ==
                                            "development"
                                                ? process.env.LOCAL_IMAGE_URL
                                                : __ImagePathDetails?.EnvSettingTextValue) +
                                            hp.Hospital?.ProfilePic,
                                    })),
                                }),
                            ...(item[item?.AssetTypeID?.lookup_value]
                                ?.LocationID && {
                                LocationID: [
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.AddressLine1,
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.AddressLine2,
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.CityId?.lookup_value,
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.StateId?.lookup_value,
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.CountryId?.lookup_value,
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.PIN,
                                ]
                                    .filter((location) => location)
                                    .join(", "),

                                City:
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.CityId?.lookup_value ||
                                    null,
                                State:
                                    item[item?.AssetTypeID?.lookup_value]
                                        ?.LocationID?.StateId?.lookup_value ||
                                    null,
                            }),
                            ...(item[item?.AssetTypeID?.lookup_value]
                                ?.DoctorID &&
                                item[item?.AssetTypeID?.lookup_value]?.DoctorID
                                    .length > 0 && {
                                    DoctorID: item[
                                        item?.AssetTypeID?.lookup_value
                                    ]?.DoctorID.map((hp) => ({
                                        _id: hp._id,
                                        AssetName: hp.AssetName,
                                        ProfilePic:
                                            (process.env.NODE_ENV ==
                                            "development"
                                                ? process.env.LOCAL_IMAGE_URL
                                                : __ImagePathDetails?.EnvSettingTextValue) +
                                            hp.Doctor?.ProfilePic,
                                        IsStar: hp.Doctor?.IsStar,
                                    })).filter((doctor) => doctor.IsStar),
                                }),

                            SuperSpecialization:
                                specialtydetails?.SuperSpecialization || [],
                            SubSpeciality:
                                specialtydetails?.SubSpeciality || [],
                            Speciality: specialtydetails?.SpecialtyId || null,
                        },
                        MetaData: {
                            Facebook:
                                metaList.find(
                                    (ml) =>
                                        ml?.DataTypeId ==
                                        __GetFB?.EnvSettingValue
                                )?.MetaDataValue || null,
                            Linkedin:
                                metaList.find(
                                    (ml) =>
                                        ml?.DataTypeId ==
                                        __GetLD?.EnvSettingValue
                                )?.MetaDataValue || null,
                            Instagram:
                                metaList.find(
                                    (ml) =>
                                        ml?.DataTypeId ==
                                        __GetIG?.EnvSettingValue
                                )?.MetaDataValue || null,
                            Twitter:
                                metaList.find(
                                    (ml) =>
                                        ml?.DataTypeId ==
                                        __GetX?.EnvSettingValue
                                )?.MetaDataValue || null,
                            Youtube:
                                metaList.find(
                                    (ml) =>
                                        ml?.DataTypeId ==
                                        __GetYT?.EnvSettingValue
                                )?.MetaDataValue || null,
                        },
                    };
                })
            )
        );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/IsAvailableAsset", __fetchToken, async (req, res) => {
    try {
        const { AssetName, ContactNo } = req.body;
        if (!AssetName) {
            return res.json(
                __requestResponse("400", "Please enter asset name")
            );
        }
        if (!ContactNo) {
            return res.json(__requestResponse("400", "Please enter ContactNo"));
        }
        const populateData = new Array();
        const showData = new Array(["AssetName AssetCode ", AssetName]);
        const filterData = new Object({ AssetName: AssetName });

        if (["Hospital"].includes(AssetName)) {
            filterData[AssetName + ".ContactNo"] = ContactNo;
            showData.push("Hospital.Name");
            showData.push("Hospital.ContactNo");
            showData.push("Hospital.PostalCode");
            showData.push("Hospital.HospitalType");
        }
        if (["Doctor"].includes(AssetName)) {
            filterData[AssetName + ".MobileNo"] = ContactNo;
            showData.push("Doctor.FirstName");
            showData.push("Doctor.LastName");
            showData.push("Doctor.MobileNo");
            showData.push("Doctor.PostalCode");
            showData.push("Doctor.Speciality");
        }
        if (["Pharmacy"].includes(AssetName)) {
            filterData[AssetName + ".ContactNo"] = ContactNo;
            showData.push("Pharmacy.Name");
            showData.push("Pharmacy.ContactNo");
            showData.push("Pharmacy.PostalCode");
        }
        if (["Pathology"].includes(AssetName)) {
            filterData[AssetName + ".ContactNo"] = ContactNo;
            showData.push("Pathology.Name");
            showData.push("Pathology.ContactNo");
            showData.push("Pathology.PostalCode");
        }

        const details = await AssetMaster.findOne(
            filterData,
            showData.join(" ")
        );

        if (!details) {
            return res.json(__requestResponse("404", __DATA_404));
        }

        return res.json(__requestResponse("200", __SUCCESS, details));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/AddFavoriteAsset", __fetchToken, async (req, res) => {
    try {
        const {
            IsLinkWithFamily,
            AssetId,
            FamilyId,
            ContactNo,
            AssetEnvCode,
            FirstName,
            LastName,
            Speciality,
            PostalCode,
            Name,
            HospitalType,
        } = req.body;

        const allUsers = new Array(FamilyId);

        if (IsLinkWithFamily) {
            if (FamilyId != req.user.id) {
                allUsers.push(req.user.id);
            }
            const allMember = await AssetMaster.find(
                {
                    ParentID: req.user.id,
                },
                "_id"
            );
            __deepClone(allMember).map((item) => {
                FamilyId != item?._id && allUsers.push(item?._id);
            });
        }

        if (AssetId && AssetId?.trim()) {
            const assetDetails = await AssetMaster.findById(
                AssetId,
                "AssetTypeID"
            );
            if (!assetDetails) {
                return res.json(__requestResponse("404", __DATA_404));
            }

            if (IsLinkWithFamily) {
                allUsers.forEach(async (element) => {
                    await AddFavoriteAsset({
                        AssetId: element,
                        FavAssetId: assetDetails._id,
                        AssetTypeId: assetDetails.AssetTypeID,
                    });
                });

                return res.json(__requestResponse("200", __SUCCESS));
            }
            const dataObject = {
                AssetId: FamilyId,
                FavAssetId: assetDetails._id,
                AssetTypeId: assetDetails.AssetTypeID,
            };

            const check = await Favourites.findOne(dataObject);
            if (check) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Already available in your favourites"
                    )
                );
            }
            await Favourites.create(dataObject);
            return res.json(__requestResponse("200", __SUCCESS));
        }

        const AssetTypeDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: AssetEnvCode,
        });
        if (!AssetTypeDetails) {
            return res.json(__requestResponse("400", "Invalid EnvSettingCode"));
        }
        const assetDetails = await LookupModel.findById(
            AssetTypeDetails.EnvSettingValue
        );
        if (!assetDetails) {
            return res.json(
                __requestResponse("400", "Invalid EnvSettingValue")
            );
        }

        const dataObject = new Object();
        if (assetDetails.lookup_value == "Doctor") {
            dataObject.IsFavourite = true;
            dataObject.AssetTypeID = assetDetails?._id;
            dataObject.AssetName = [FirstName, LastName].join(" ");
            dataObject.EntryBy = req.user.id;
            dataObject.Doctor = {
                FirstName,
                LastName,
                Speciality,
                PostalCode,
                MobileNo: ContactNo,
            };
            const checkDoctor = await AssetMaster.findOne({
                AssetTypeID: assetDetails?._id,
                "Doctor.MobileNo": ContactNo,
            });
            if (checkDoctor) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Already available in your favourites"
                    )
                );
            }
        }
        if (assetDetails.lookup_value == "Hospital") {
            dataObject.IsFavourite = true;
            dataObject.AssetTypeID = assetDetails?._id;
            dataObject.AssetName = Name;
            dataObject.EntryBy = req.user.id;
            dataObject.Hospital = {
                Name,
                ContactNo,
                HospitalType,
                PostalCode,
            };
            const checkHospital = await AssetMaster.findOne({
                AssetTypeID: assetDetails?._id,
                "Hospital.ContactNo": ContactNo,
            });
            if (checkHospital) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Already available in your favourites"
                    )
                );
            }
        }
        if (assetDetails.lookup_value == "Pharmacy") {
            dataObject.IsFavourite = true;
            dataObject.AssetTypeID = assetDetails?._id;
            dataObject.AssetName = Name;
            dataObject.EntryBy = req.user.id;
            dataObject.Pharmacy = {
                Name,
                ContactNo,
                PostalCode,
            };
            const checkHospital = await AssetMaster.findOne({
                AssetTypeID: assetDetails?._id,
                "Pharmacy.ContactNo": ContactNo,
            });
            if (checkHospital) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Already available in your favourites"
                    )
                );
            }
        }
        if (assetDetails.lookup_value == "Pathology") {
            dataObject.IsFavourite = true;
            dataObject.AssetTypeID = assetDetails?._id;
            dataObject.AssetName = Name;
            dataObject.EntryBy = req.user.id;
            dataObject.Pathology = {
                Name,
                ContactNo,
                PostalCode,
            };
            const checkHospital = await AssetMaster.findOne({
                AssetTypeID: assetDetails?._id,
                "Pathology.ContactNo": ContactNo,
            });
            if (checkHospital) {
                return res.json(
                    __requestResponse(
                        "400",
                        "Already available in your favourites"
                    )
                );
            }
        }

        const newAsset = await AssetMaster.create(dataObject);

        if (IsLinkWithFamily) {
            allUsers.forEach(async (element) => {
                await AddFavoriteAsset({
                    AssetId: element,
                    FavAssetId: newAsset._id,
                    AssetTypeId: newAsset.AssetTypeID,
                });
            });

            return res.json(__requestResponse("200", __SUCCESS));
        }
        await Favourites.create({
            AssetId: FamilyId,
            FavAssetId: newAsset._id,
            AssetTypeId: newAsset.AssetTypeID,
        });

        return res.json(__requestResponse("200", __SUCCESS, assetDetails));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
router.post("/GetFavoriteAssets", __fetchToken, async (req, res) => {
    try {
        const { AssetName, AssetId, AssetEnvCode } = req.body;
        console.log(req.body);
        if (!AssetName) {
            return res.json(
                __requestResponse("400", "Please enter asset name")
            );
        }

        const populateData = new Array();
        const showData = new Array([
            "AssetName AssetCode EntryBy IsFavourite",
            AssetName,
        ]);

        if (["Hospital"].includes(AssetName)) {
            showData.push("Hospital.Name");
            showData.push("Hospital.ContactNo");
            showData.push("Hospital.PostalCode");
            showData.push("Hospital.HospitalType");
            populateData.push({
                path: "Hospital.HospitalType",
                select: "lookup_value",
            });
        }
        if (["Doctor"].includes(AssetName)) {
            showData.push("Doctor.FirstName");
            showData.push("Doctor.LastName");
            showData.push("Doctor.MobileNo");
            showData.push("Doctor.PostalCode");
            showData.push("Doctor.Speciality");
            populateData.push({
                path: "Doctor.Speciality",
                select: "lookup_value",
            });
        }
        if (["Pharmacy"].includes(AssetName)) {
            showData.push("Pharmacy.Name");
            showData.push("Pharmacy.ContactNo");
        }
        if (["Pathology"].includes(AssetName)) {
            showData.push("Pathology.Name");
            showData.push("Pathology.ContactNo");
        }
        console.log(showData);
        const AssetTypeDetails = await AdminEnvSetting.findOne({
            EnvSettingCode: AssetEnvCode,
        });
        if (!AssetTypeDetails) {
            return res.json(__requestResponse("400", "Invalid EnvSettingCode"));
        }

        console.log(AssetTypeDetails);
        const details = await Favourites.find({
            AssetId,
            AssetTypeId: AssetTypeDetails?.EnvSettingValue,
        }).populate({
            path: "FavAssetId",
            select: showData.join(" "),
            populate: populateData,
        });

        if (!details) {
            return res.json(__requestResponse("404", __DATA_404));
        }

        return res.json(__requestResponse("200", __SUCCESS, details));
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/GetServiceList", __fetchToken, async (req, res) => {
    try {
        const { ServiceModeType, AssetType } = req.body;

        console.log({ ServiceModeType, AssetType });

        const _serviceMode = await GetENV(ServiceModeType);
        if (!_serviceMode) {
            return res.json(
                __requestResponse(
                    "400",
                    "Invalid Service Mode Type or Not Found"
                )
            );
        }
        const _serviceModeID = mongoose.Types.ObjectId.isValid(
            _serviceMode?.EnvSettingValue
        )
            ? mongoose.Types.ObjectId(_serviceMode?.EnvSettingValue)
            : null;

        if (!_serviceModeID) {
            return res.json(
                __requestResponse(
                    "400",
                    "Invalid Service Mode Type or Not Found"
                )
            );
        }

        const _assetType = await GetENV(AssetType);
        if (!_assetType) {
            return res.json(
                __requestResponse("400", "Invalid Asset Type or Not Found")
            );
        }
        const __ContractServiceM = await ContractServiceMapping.find({
            ServiceId: _serviceModeID,
        }).populate([
            {
                path: "ContractId",
                populate: {
                    path: "AssetId",
                    // populate: {
                    //     path: "Doctor.Speciality",
                    // },
                },
            },
        ]);
        const __ImagePathDetails = await GetENV("IMAGE_PATH");

        const __NewContractServiceM = __deepClone(__ContractServiceM)
            .filter(
                (item) =>
                    item?.ContractId?.AssetId?.AssetTypeID ==
                    _assetType?.EnvSettingValue
            )
            .map((item) => ({
                ContractMappingDetails: {
                    CM_Id: item?._id,
                    ServiceId: item?.ServiceId,
                    ServiceModeId: item?.ServiceModeId,
                    RateINR: item?.RateINR,
                    RateUSD: item?.RateUSD,
                    MRPINR: item?.MRPINR,
                    MRPUSD: item?.MRPUSD,
                    OfferINR: item?.OfferINR,
                    OfferUSD: item?.OfferUSD,
                    ServiceCategoryId: item?.ServiceCategoryId,
                    ServiceSubCategoryId: item?.ServiceSubCategoryId,
                    IsDiscountAvailable: item?.IsDiscountAvailable,
                },
                ContractDetails: {
                    ContractId: item?.ContractId?._id,
                },
                AssetDetails: {
                    AssetId: item?.ContractId?.AssetId?._id,
                    Name:
                        [
                            item?.ContractId?.AssetId?.Doctor?.FirstName,
                            item?.ContractId?.AssetId?.Doctor?.LastName,
                        ].join(" ") || "",
                    QualificationAndExperience:
                        item?.ContractId?.AssetId?.Doctor?.QualificationAndExperience?.map(
                            (qe) => qe?.qualification
                        ).join(", ") || "",
                    Speciality: "Medicine Expert",
                    Address: "",
                    ContactNo: item?.ContractId?.AssetId?.Doctor?.MobileNo,
                    ProfilePic:
                        (process.env.NODE_ENV == "development"
                            ? process.env.LOCAL_IMAGE_URL
                            : __ImagePathDetails?.EnvSettingTextValue) +
                        item?.ContractId?.AssetId?.Doctor?.ProfilePic,
                },
            }));

        return res.json(
            __requestResponse("200", __SUCCESS, __NewContractServiceM)
        );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

router.post("/GetPharmacyList", __fetchToken, async (req, res) => {
    try {
        const { AddressId } = req.body;
        const _My_Address = await AddressMaster.findById(AddressId);
        if (!_My_Address) {
            return res.json(__requestResponse("400", "Invalid Address"));
        }

        const _EnvAP = await GetENV("ASSET_TYPE_PHARMACY", "multi");

        const _assetPharmacy = _EnvAP.map((item) =>
            mongoose.Types.ObjectId(item?.EnvSettingValue)
        );

        const _AP_OP_list = await AssetMaster.find(
            { AssetTypeID: { $in: _assetPharmacy } },
            "AssetName"
        );

        const _OP_Address = await AddressMaster.find({
            AssetId: _AP_OP_list.map((item) => item._id),
        });

        return res.json(
            __requestResponse("200", __SUCCESS, {
                Favourites: [],
                Recommended: [],
                OurPartner: __deepClone(_AP_OP_list).map((item) => {
                    const address = __deepClone(_OP_Address).find(
                        (addr) => addr?.AssetId == item._id
                    );
                    return {
                        ...item,
                        Distance: address
                            ? __calculateDistance(
                                  _My_Address?.geolocation?.coordinates[0],
                                  _My_Address?.geolocation?.coordinates[1],
                                  address?.geolocation?.coordinates[0],
                                  address?.geolocation?.coordinates[1]
                              )
                            : "-",
                        Latitude: address
                            ? address?.geolocation?.coordinates[0]
                            : null,
                        Longitude: address
                            ? address?.geolocation?.coordinates[1]
                            : null,
                    };
                }),
            })
        );
    } catch (error) {
        console.log(error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});
module.exports = router;
