const express = require("express");
const router = express.Router();
const ZatraMaster = require("../../../models/ZatraMaster");
const {
  __SUCCESS,
  __SOME_ERROR,
} = require("../../../utils/variable");
const { __requestResponse, __deepClone } = require("../../../utils/constent");

router.post("/ZatraList", async (req, res) => {
  try {
    const {
      ZatraType,
      ZatraName,
      CityId,
      StartDate,
      EndDate,
      page = 1,
      limit = 10,
      ZatraCategoryId,
    } = req.body;

    const filter = {};

    if (ZatraType) filter.ZatraType = ZatraType;
    if (ZatraName) filter.ZatraName = { $regex: ZatraName, $options: "i" };
    if (StartDate) filter.StartDate = { $gte: new Date(StartDate) };
    if (EndDate) filter.EndDate = { $lte: new Date(EndDate) };
    if (CityId) filter.CityId = { $in: CityId };
    if (ZatraCategoryId) filter.ZatraCategoryId = { $in: ZatraCategoryId };

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ZatraMaster.find(filter)
        .populate("CityId", "lookup_value")
        .populate("ZatraCategoryId", "lookup_value")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ZatraMaster.countDocuments(filter),
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
