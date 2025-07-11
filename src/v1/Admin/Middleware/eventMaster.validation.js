const Joi = require("joi");

const saveEventSchema = Joi.object({
  event_id: Joi.string().optional(),

  EventTypeId: Joi.string().required().messages({
    "any.required": "Event Type is required",
    "string.empty": "Event Type cannot be empty",
  }),

  Category: Joi.string().required().messages({
    "any.required": "Category is required",
    "string.empty": "Category cannot be empty",
  }),

  EventTitle: Joi.string().required().messages({
    "any.required": "Event Title is required",
    "string.empty": "Event Title cannot be empty",
  }),

  StartDate: Joi.date().required().messages({
    "any.required": "Start Date is required",
    "date.base": "Start Date must be a valid date",
  }),

  EndDate: Joi.date().required().min(Joi.ref("StartDate")).messages({
    "any.required": "End Date is required",
    "date.base": "End Date must be a valid date",
    "date.min": "End Date must be after or equal to Start Date",
  }),

  Logo: Joi.string().optional(),

  EventOrganisers: Joi.array().items(Joi.string()).optional(),

  //   EventCatalogue: Joi.array().items(Joi.string()).optional(),
  EventCatalogue: Joi.string().required().messages({
    "any.required": "Event Catalogue is required",
    "string.empty": "Event Catalogue cannot be empty",
  }),
  EventVenueType: Joi.string().required().messages({
    "any.required": "Event Venue Type is required",
    "string.empty": "Event Venue Type cannot be empty",
  }),
  Comments: Joi.string().allow("", null).optional(),
});

const validateSaveEvent = (req, res, next) => {
  const { error } = saveEventSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json({
      status: "400",
      message: "Validation Error",
      error: error.details.map((d) => d.message),
    });
  }
  next();
};

module.exports = {
  validateSaveEvent,
};
