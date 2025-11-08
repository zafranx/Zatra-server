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
const ServiceProviderMaster = require("../../../models/ServiceProviderMaster");

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
