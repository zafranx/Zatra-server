const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const ProductInventoryMaster = require("../../../models/ProductInventoryMaster");
const { default: mongoose } = require("mongoose");
//  products
const saveProductSchema = Joi.object({
  // _id: Joi.string().allow("", null).optional(),
  _id: Joi.string()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Invalid _id format",
    }),

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

// products variants
const saveProductVariantSchema = Joi.object({
  // _id: Joi.string().allow("", null).optional(),
  _id: Joi.string()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Invalid _id format",
    }),

  ProductId: Joi.string().required().messages({
    "any.required": "Product ID is required",
    "string.empty": "Product ID cannot be empty",
  }),

  ProductVariantName: Joi.string().required().messages({
    "any.required": "Product Variant Name is required",
    "string.empty": "Product Variant Name cannot be empty",
  }),

  ProductVariantCode: Joi.string().required().messages({
    "any.required": "Product Variant Code / Model No is required",
    "string.empty": "Product Variant Code / Model No cannot be empty",
  }),

  ShortDesc: Joi.string().allow("").optional(),
  LongDesc: Joi.string().allow("").optional(),

  ImageGallery: Joi.array().items(Joi.string()).optional(),
  VideoGallery: Joi.array().items(Joi.string()).optional(),

  MRP: Joi.number().required().messages({
    "any.required": "MRP is required",
    "number.base": "MRP must be a number",
  }),

  OnlyForB2BSale: Joi.boolean().required().messages({
    "any.required": "OnlyForB2BSale flag is required",
    "boolean.base": "OnlyForB2BSale must be true or false",
  }),
});

const validateSaveProductVariant = (req, res, next) => {
  const { error } = saveProductVariantSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }

  next();
};

// product inventory validation
const saveProductInventorySchema = Joi.object({
  // _id: Joi.string().allow("", null).optional(),
  _id: Joi.string()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Invalid ID format",
    }),
  // 2nd logic
  // _id: Joi.string()
  //   .custom((value, helpers) => {
  //     if (!mongoose.Types.ObjectId.isValid(value)) {
  //       return helpers.error("any.invalid");
  //     }
  //     return value;
  //   })
  //   .required()
  //   .messages({
  //     "any.required": "Product Variant _id is required",
  //     "string.empty": "Product Variant _id cannot be empty",
  //     "any.invalid": "Invalid Product Variant ID format",
  //   }),
  ProductVariantId: Joi.string().required().messages({
    "any.required": "Product _id is required",
    "string.empty": "Product Variant cannot be empty",
  }),

  LotNo: Joi.string().required().messages({
    "any.required": "Lot Number is required",
    "string.empty": "Lot Number cannot be empty",
  }),

  Quantity: Joi.number().required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
  }),
});

const validateSaveProductInventory = async (req, res, next) => {
  const { _id } = req.body;
  const { error } = saveProductInventorySchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.json(
      __requestResponse("400", "Validation Error", {
        error: error.details.map((d) => d.message),
      })
    );
  }

  // Duplicate check (ProductVariantId + LotNo should be unique)
  const duplicate = await ProductInventoryMaster.findOne({
    _id: { $ne: _id },
    ProductVariantId: req.body.ProductVariantId,
    LotNo: req.body.LotNo,
  });

  if (duplicate) {
    return res.json(
      __requestResponse(
        "400",
        "This LotNo is already used for the selected Product Variant"
      )
    );
  }

  next();
};

// product inward validation
const saveProductInwardSchema = Joi.object({
  _id: Joi.string()
    .allow("", null)
    .optional()
    .custom((value, helpers) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.invalid": "Invalid _id format",
    }),

  ProductVariantId: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "any.required": "Product Variant ID is required",
      "string.empty": "Product Variant ID cannot be empty",
      "any.invalid": "Invalid Product Variant ID format",
    }),

  LotNo: Joi.string().required().messages({
    "any.required": "Lot Number is required",
    "string.empty": "Lot Number cannot be empty",
  }),

  InputQuantity: Joi.number().required().messages({
    "any.required": "Input Quantity is required",
    "number.base": "Input Quantity must be a number",
  }),

  DateTime: Joi.date().optional().messages({
    "date.base": "DateTime must be a valid date",
  }),
});

const validateSaveProductInward = (req, res, next) => {
  const { error } = saveProductInwardSchema.validate(req.body, {
    abortEarly: false,
  });

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
  validateSaveProduct,
  validateSaveProductVariant,
  validateSaveProductInventory,
  validateSaveProductInward,
};
