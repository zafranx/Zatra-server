const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const AdminEnvSetting = require("../../../models/AdminEnvSetting");
const AssetMaster = require("../../../models/AssetMaster");

const _SaveRealEstateProject = Joi.object({
  real_estate_project_id: Joi.string().allow(null, ""),
  asset_type_id: Joi.string().allow(null, ""),
  parent_id: Joi.string().allow(null, ""),
  entry_by: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  short_desc: Joi.string().allow(null, ""),
  long_desc: Joi.string().allow(null, ""),
  address_id: Joi.string().allow(null, ""),
  completion_deadlines: Joi.string().allow(null, ""),
});

const checkRealEstateProjectData = async (req, res, next) => {
  try {
    const { error } = _SaveRealEstateProject.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    const _AssetType = await AdminEnvSetting.findOne({
      EnvSettingCode: "ASSET_TYPE_REAL_ESTATE_PROJECT",
    });

    if (_AssetType) {
      req.body.asset_type_id = _AssetType.EnvSettingValue;
    } else {
      return res.json(
        __requestResponse("400", "Real Estate Project Asset Type not found.")
      );
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkRealEstateProjectData };
