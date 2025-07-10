// const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
// const tlbEnvSetting = require("../../../models/AdminEnvSetting");

const _SaveMetaData = Joi.object({
  assetId: Joi.string().required(),
  metaData_id: Joi.string().allow(null, ""),
  dataTypeId: Joi.string().required(),
  metaDataValue: Joi.string().required(),
  assetId: Joi.string().required(),
  isActive: Joi.boolean().allow(true, false, null),
  // updateBy: Joi.string().allow(null, ""),
  // createdBy: Joi.string().required(),
});

const checkMetaData = async (req, res, next) => {
  try {
    //Check the data hygiene
    const { error, value } = _SaveMetaData.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};
module.exports = { checkMetaData };
