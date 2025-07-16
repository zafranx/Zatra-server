const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { default: mongoose } = require("mongoose");

// Joi Schema
const saveBrandSchema = Joi.object({
  // _id: Joi.string().optional(),
  _id: Joi.string()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .allow(null, "")
    .optional(),

  BrandAssociatedWith: Joi.string().required().messages({
    "any.required": "BrandAssociatedWith is required",
    "string.empty": "BrandAssociatedWith cannot be empty",
  }),
  CreatedRef: Joi.string()
    .required()
    .valid("product_master", "asset_master")
    .messages({
      "any.required": "CreatedRef is required",
      "any.only":
        "CreatedRef must be either 'product_master' or 'asset_master'",
      "string.empty": "CreatedRef cannot be empty",
    }),

  AssetId: Joi.string().optional().allow(null, ""),
  ProductId: Joi.array()
    .items(Joi.string().allow("", null))
    .optional()
    .messages({
      "array.base": "ProductId must be an array of IDs",
    }),

  BrandTypeId: Joi.string().required().messages({
    "any.required": "Brand Type is required",
    "string.empty": "Brand Type cannot be empty",
  }),

  BrandImage: Joi.string().optional().allow(""),
  BrandText: Joi.string().optional().allow(""),
  BrandAdvertisements: Joi.string().optional().allow(""),
  BrandVideos: Joi.string().optional().allow(""),
  Comments: Joi.string().optional().allow(""),
});

// Middleware
const validateSaveBrand = (req, res, next) => {
  const { error } = saveBrandSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }
  next();
};

module.exports = {
  validateSaveBrand,
};
