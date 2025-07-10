const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const { __VALIDATION_ERROR, __SOME_ERROR } = require("../../../utils/variable");

const _SaveEvent = Joi.object({
  event_id: Joi.string().allow(null, ""),
  eventTitle: Joi.string().required(),
  // categoryId: Joi.string().required(),
  categoryId: Joi.string().allow(null, ""),
  subCategoryId: Joi.string().allow(null, ""),
  destinationId: Joi.string().allow(null, ""),
  startDate: Joi.date().allow(null, ""),
  endDate: Joi.date().allow(null, ""),
  addressId: Joi.string().allow(null, ""),
  cityId: Joi.string().allow(null, ""),
  // cityGroupId: Joi.array().items(Joi.string()).allow(null, []),
  cityGroupId: Joi.array().items(Joi.string()).allow(null, ""),
  images: Joi.array().items(Joi.string()).allow(null, ""),
  videos: Joi.array().items(Joi.string()).allow(null, ""),
  // images: Joi.array().items(Joi.string()).allow(null, []),
  // videos: Joi.array().items(Joi.string()).allow(null, []),
});

const checkEventData = async (req, res, next) => {
  try {
    const { error, value } = _SaveEvent.validate(req.body);
    if (error) {
      return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
    }
    next();
  } catch (error) {
    return res.json(__requestResponse("500", __SOME_ERROR));
  }
};

module.exports = { checkEventData };
