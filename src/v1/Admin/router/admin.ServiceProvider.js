const express = require("express");
const router = express.Router();

const AncillaryServiceMaster = require("../../../models/AncillaryServicesMaster");
const {
    validateSaveAncillaryService,
} = require("../Middleware/ancillaryService.validation");
const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const ServiceProviderMaster = require("../../../models/ServiceProviderMaster");

// 🔹 Add / Edit Ancillary Service
router.post(
    "/SaveServiceProvider",
    // validateSaveAncillaryService, // commennted for development purpose
    async (req, res) => {
        try {
            const {
                _id,
                ZatraId,
                StationId,
                AssetId,
                ServiceType,
                ServiceProvider,
                ProfilePicture,
                ContactNumber,
                EmailAddress,
                Website,
                Facebook,
                Instagram,
                Youtube,
                PictureGallery,
                VideoGallery,
                VideosUrl,
                IsVerified,
            } = req.body;

            const saveData = {
                ZatraId,
                StationId,
                AssetId,
                ZatraId,
                StationId,
                AssetId,
                ServiceType,
                ServiceProvider,
                ProfilePicture,
                ContactNumber,
                EmailAddress,
                Website,
                Facebook,
                Instagram,
                Youtube,
                PictureGallery,
                VideoGallery,
                VideosUrl,
                IsVerified,
            };

            if (!_id) {
                const newRec = await ServiceProviderMaster.create(saveData);
                await __CreateAuditLog(
                    "service_provider_master",
                    "ServiceProvider.Add",
                    null,
                    null,
                    saveData,
                    newRec._id
                );
                return res.json(__requestResponse("200", __SUCCESS, newRec));
            } else {
                const oldRec = await ServiceProviderMaster.findById(_id);
                if (!oldRec)
                    return res.json(
                        __requestResponse("400", __RECORD_NOT_FOUND)
                    );

                await ServiceProviderMaster.updateOne(
                    { _id },
                    { $set: saveData }
                );
                await __CreateAuditLog(
                    "service_provider_master",
                    "ServiceProvider.Edit",
                    null,
                    oldRec,
                    saveData,
                    _id
                );
                return res.json(__requestResponse("200", __SUCCESS, saveData));
            }
        } catch (error) {
            console.error(error);
            return res.json(__requestResponse("500", __SOME_ERROR, error));
        }
    }
);

// 🔹 List Ancillary Services
router.post("/ServiceProviderList", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            ServiceType,
            AssetId,
        } = req.body;

        const filter = {};
        if (search) {
            filter.ServiceProvider = { $regex: search, $options: "i" };
        }
        if (ServiceType) filter.ServiceType = ServiceType;
        if (AssetId) filter.AssetId = AssetId;

        const total = await ServiceProviderMaster.countDocuments(filter);
        const list = await ServiceProviderMaster.find(filter)
            .populate("ServiceType", "lookup_value")
            .populate("StationId", "lookup_value")
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
