const express = require("express");
const router = express.Router();

const { __requestResponse, __deepClone } = require("../../../utils/constent");
const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");
const { __CreateAuditLog } = require("../../../utils/auditlog");
const ServicePackageMaster = require("../../../models/ServicePackageMaster");

router.post("/SaveServicePackage", async (req, res) => {
    try {
        const {
            _id,
            ZatraId,
            StationId,
            AssetId,
            PackageType,
            Currency,
            PakageTitle,
            PakageDescripton,
            PakagePrice,
            DiscountPrice,
            PakagePoster,
            PakageVideo,
            PictureGallery,
            VideoGallery,
        } = req.body;

        const saveData = {
            ZatraId,
            StationId,
            AssetId,
            PackageType,
            Currency,
            PakageTitle,
            PakageDescripton,
            PakagePrice,
            DiscountPrice,
            PakagePoster,
            PakageVideo,
            PictureGallery,
            VideoGallery,
        };

        if (!_id) {
            const newRec = await ServicePackageMaster.create(saveData);
            await __CreateAuditLog(
                "service_package_master",
                "ServicePackage.Add",
                null,
                null,
                saveData,
                newRec._id
            );
            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            const oldRec = await ServicePackageMaster.findById(_id);
            if (!oldRec)
                return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

            await ServicePackageMaster.updateOne({ _id }, { $set: saveData });
            await __CreateAuditLog(
                "service_package_master",
                "ServicePackage.Edit",
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
});

router.post("/ServicePackageList", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            PackageType,
            AssetId,
        } = req.body;

        const filter = {};
        if (search) {
            filter.ServiceProvider = { $regex: search, $options: "i" };
        }
        if (PackageType) filter.PackageType = PackageType;
        if (AssetId) filter.AssetId = AssetId;

        const total = await ServicePackageMaster.countDocuments(filter);
        const list = await ServicePackageMaster.find(filter)
            .populate("PackageType", "lookup_value")
            .populate("Currency", "lookup_value")
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
