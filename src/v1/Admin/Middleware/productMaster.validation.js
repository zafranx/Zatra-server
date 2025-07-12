const Joi = require("joi");

const saveProductSchema = Joi.object({
  _id: Joi.string().optional(),

  LegalEntityId: Joi.string().required().messages({
    "any.required": "Legal Entity is required",
    "string.empty": "Legal Entity cannot be empty",
  }),

  CategoryId: Joi.string().required().messages({
    "any.required": "Category is required",
    "string.empty": "Category cannot be empty",
  }),

  SubCategoryId: Joi.string().required().messages({
    "any.required": "SubCategory is required",
    "string.empty": "SubCategory cannot be empty",
  }),

  BrandId: Joi.string().required().messages({
    "any.required": "Brand is required",
    "string.empty": "Brand cannot be empty",
  }),

  ProductName: Joi.string().required().messages({
    "any.required": "Product Name is required",
    "string.empty": "Product Name cannot be empty",
  }),

  ShortDesc: Joi.string().optional().allow(""),
  LongDesc: Joi.string().optional().allow(""),

  ProductImages: Joi.array().items(Joi.string()).optional(),
  ProductVideos: Joi.array().items(Joi.string()).optional(),

  IsActive: Joi.boolean().required().messages({
    "any.required": "IsActive flag is required",
  }),
});

const validateSaveProduct = (req, res, next) => {
  const { error } = saveProductSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }
  next();
};

module.exports = { validateSaveProduct };
