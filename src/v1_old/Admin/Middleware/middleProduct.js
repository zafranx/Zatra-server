const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");

const _validateProduct = Joi.object({
  product_id: Joi.string().allow("", null),
  ProductTypeID: Joi.string().allow("", null),
  ProductDesc: Joi.string().required(), // it is product name
  // ProductDesc: Joi.string().allow("", null),
  ProductPictures: Joi.array().items(Joi.string()).allow(null),
  // ProductPictures: Joi.alternatives()
  //   .try(
  //     Joi.array().items(Joi.string()),
  //     Joi.string().custom((val) => [val]) // Convert single string to array
  //   )
  //   .default([]),

  MRP: Joi.number().required(),
  ProductCategoryID: Joi.string().allow("", null),
  ProductSubCategoryID: Joi.string().allow("", null),
  MaxCapPrice: Joi.number().allow(null),
  ForExhibition: Joi.boolean().allow("", null),
  ExhibitorID: Joi.string().allow("", null),
  AssetID: Joi.string().allow("", null),
});

const checkProductData = async (req, res, next) => {
  try {
    const { error } = _validateProduct.validate(req.body);
    if (error)
      return res.json(
        __requestResponse("400", __VALIDATION_ERROR, error.details[0].message)
      );
    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

//  Joi Validation
const _validateProductDetail = Joi.object({
  detail_id: Joi.string().allow(null, ""),
  ProductID: Joi.string().required(),
  // ValueType: Joi.string().valid("String", "Image", "Video").required(),
  ValueType: Joi.string().required(),
  ValueKey: Joi.string().required(),
  Value: Joi.string().required(),
});

const checkProductDetailData = async (req, res, next) => {
  try {
    const { error } = _validateProductDetail.validate(req.body);
    if (error)
      return res.json(
        __requestResponse("400", __VALIDATION_ERROR, error.details[0].message)
      );
    next();
  } catch (error) {
    console.log(error, "err");
    return res.json(__requestResponse("500", __SOME_ERROR, error));
  }
};

module.exports = { checkProductData, checkProductDetailData };
