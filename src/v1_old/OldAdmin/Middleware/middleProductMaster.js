const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");
const ProductMaster = require("../../../models/ProductMaster");

const _SaveProduct = Joi.object({
  product_id: Joi.string().allow(null, ""),
  asset_id: Joi.string().required(),
  category_id: Joi.string().required(),
  sub_category_id: Joi.string().allow(null, ""),
  brand_id: Joi.string().required(),
  plant_id: Joi.array().items(Joi.string()).allow(null, ""),
  product_name: Joi.string().required(),
  short_desc: Joi.string().allow(null, ""),
  long_desc: Joi.string().allow(null, ""),
  city_id: Joi.string().allow(null, ""),
  city_group_id: Joi.array().items(Joi.string()).allow(null, ""),
  mrp: Joi.number().required(),
  discounts: Joi.number().allow(null, ""),
  offer_price: Joi.number().allow(null, ""),
  product_images: Joi.array().items(Joi.string()).allow(null, ""),
  product_videos: Joi.array().items(Joi.string()).allow(null, ""),
  is_odop: Joi.boolean().allow(null, ""),
  is_vocal_for_local: Joi.boolean().allow(null, ""),
  is_active: Joi.boolean().allow(null, ""),
});

const checkProductData = async (req, res, next) => {
  try {
    // Validate request body
    const { error } = _SaveProduct.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error.details));
    }

    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkProductData };
