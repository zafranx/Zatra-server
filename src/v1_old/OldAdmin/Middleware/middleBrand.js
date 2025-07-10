const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const BrandMaster = require("../../../models/BrandMaster");

const _SaveBrand = Joi.object({
  assetId: Joi.string().required(),
  brand_id: Joi.string().allow(null, ""),
  // categoryId: Joi.string().required(),
  categoryId: Joi.string().allow(null, ""),

  subCategoryId: Joi.string().allow(null, ""),
  name: Joi.string().required(),
  shortDesc: Joi.string().allow(null, ""),
  longDesc: Joi.string().allow(null, ""),
  trademarkImages: Joi.array().items(Joi.string()).allow(null, ""),
  // trademarkImages: Joi.array().items(Joi.string()).allow(null, []),
  // trademarkImages: Joi.array().items(Joi.string()).default([]).allow(null),
  caption: Joi.string().allow(null, ""),
});

const checkBrandData = async (req, res, next) => {
  try {
    const { error, value } = _SaveBrand.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }

    // Check for duplicate Brand  Name
    if (!req.body.brand_id) {
      const existingBrand = await BrandMaster.findOne({
        Name: req.body.name,
      });

      if (existingBrand) {
        return res.json(__requestResponse("400", "Brand name already exists"));
      }
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = { checkBrandData };
