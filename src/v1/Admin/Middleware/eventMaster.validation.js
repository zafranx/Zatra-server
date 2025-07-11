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

// Venue middleware
const saveVenueSchema = Joi.object({
  Venue_Id: Joi.string().optional(),

  VenueTypeId: Joi.string().required().messages({
    "any.required": "Venue Type is required",
    "string.empty": "Venue Type cannot be empty",
  }),
  Event_Id: Joi.string().required().messages({
    "any.required": "Event_Id is required",
    "string.empty": "Event_Id cannot be empty",
  }),

  City_Exhibition_Centre_Name: Joi.string().required().messages({
    "any.required": "City / Exhibition Centre Name is required",
    "string.empty": "City / Exhibition Centre Name cannot be empty",
  }),

  Layout_Doc: Joi.string().optional().allow(""),

  Address_line1: Joi.string().required().messages({
    "any.required": "Address Line 1 is required",
    "string.empty": "Address Line 1 cannot be empty",
  }),

  Address_line2: Joi.string().optional().allow(""),

  PostalCode: Joi.number().required().messages({
    "any.required": "Postal Code is required",
    "number.base": "Postal Code must be a number",
  }),

  StateId: Joi.string().required().messages({
    "any.required": "State is required",
    "string.empty": "State cannot be empty",
  }),

  CityId: Joi.string().required().messages({
    "any.required": "City is required",
    "string.empty": "City cannot be empty",
  }),

  Geolocation: Joi.object({
    type: Joi.string().valid("Point").required().messages({
      "any.required": "Geo type is required",
      "any.only": "Geo type must be 'Point'",
      "string.empty": "Geo type cannot be empty",
    }),
    coordinates: Joi.array()
      .items(
        Joi.number().required().messages({
          "number.base": "Geo coordinates must be numbers",
        })
      )
      .length(2)
      .required()
      .messages({
        "array.length": "Geo coordinates must be [longitude, latitude]",
        "any.required": "Geo coordinates are required",
      }),
  })
    .required()
    .messages({
      "any.required": "Geolocation is required",
    }),
});

const validateSaveVenue = (req, res, next) => {
  const { error } = saveVenueSchema.validate(req.body, { abortEarly: false });
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
  validateSaveVenue,
};
