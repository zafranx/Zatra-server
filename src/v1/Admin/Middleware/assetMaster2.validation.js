const Joi = require("joi");
const mongoose = require("mongoose");
const { __requestResponse } = require("../../../utils/constent");

//  helper to check valid ObjectId
// const objectId = () =>
//   Joi.alternatives().try(
//     Joi.string()
//       .allow(null)
//       .custom((value, helpers) => {
//         if (value === null) return value;
//         if (!mongoose.Types.ObjectId.isValid(value)) {
//           return helpers.error("any.invalid");
//         }
//         return value;
//       }, "ObjectId Validation"),
//     Joi.object().instance(mongoose.Types.ObjectId)
//   );


//  helper to check valid ObjectId

const objectId = () =>
  Joi.string()
    .allow(null)
    .custom((value, helpers) => {
      if (value === null) return value;
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation");

const schema = Joi.object({
  // ------------------------
  // 1. Station & Asset Relations
  // ------------------------
  _id: objectId().optional(), // for edit
  StationId: objectId().optional(),
  ParentAssetId: objectId().optional(),

  // ------------------------
  // 2. Destination & Establishment
  // ------------------------
  IsDestination: Joi.boolean().default(false),
  EstablishmentId: objectId().optional(),
  PanchtatvaCategoryId: objectId().optional(), //Level 1
  PanchtatvaSubCategoryId: objectId().optional(), // Level 2
  Panchtatva_Sub_Sub_CategoryId: objectId().optional(), // Level 3
  IndustryId: objectId().optional(),
  DestinationName: Joi.string().allow("", null),

  // ------------------------
  // 3. Legal Entity
  // ------------------------
  LegalEntityTypeId: objectId().optional(),
  LegalEntityName: Joi.string().allow("", null),
  Registration_Number: Joi.string().allow("", null),
  GST: Joi.string().allow("", null),
  PAN: Joi.string().allow("", null),
  Registration_Address: Joi.string().allow("", null),

  // ------------------------
  // 4. Verification
  // ------------------------
  IsVerified: Joi.boolean().default(false),
  VerificationReport: Joi.string().allow("", null),
  VerifiedBy: Joi.string().allow("", null),
  VerificationDate: Joi.date().optional(),

  // ------------------------
  // 5. Allocation & Layout
  // ------------------------
  AllocationNumber: Joi.string().allow("", null),
  Lane: Joi.string().allow("", null),
  LaneNumber: Joi.string().allow("", null),
  Floor: Joi.string().allow("", null),
  FloorNumber: Joi.string().allow("", null),
  Hall: Joi.string().allow("", null),
  HallNumber: Joi.string().allow("", null),

  // ------------------------
  // 6. Address & Geolocation
  // ------------------------
  AddressLine1: Joi.string().allow("", null),
  AddressLine2: Joi.string().allow("", null),
  PostalCode: Joi.string().allow("", null),
  Geolocation: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2).required(), // [lng, lat]
  }).optional(),

  // ------------------------
  // 7. Descriptions
  // ------------------------
  ShortDescription: Joi.string().allow("", null),
  LongDescription: Joi.string().allow("", null),

  // ------------------------
  // 8. Media
  // ------------------------
  // PictureGallery: Joi.array().items(Joi.string().uri()).optional(),
  // VideoGallery: Joi.array().items(Joi.string().uri()).optional(),
  PictureGallery: Joi.array()
    .items(Joi.string().allow("", null))
    .allow(null)
    .optional(),
  VideoGallery: Joi.array()
    .items(Joi.string().allow("", null))
    .allow(null)
    .optional(),

  // ------------------------
  // 9. Timings & Hours
  // ------------------------
  OpeningDays: Joi.array().items(
    Joi.string().valid(
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    )
  ),
  OpeningTime: Joi.string().allow("", null),
  ClosingTime: Joi.string().allow("", null),
  DayBreakTime: Joi.string().allow("", null),
  BusinessHours: Joi.object({
    from: Joi.string().allow("", null),
    to: Joi.string().allow("", null),
  }).optional(),
  GeneralPublicHour: Joi.object({
    from: Joi.string().allow("", null),
    to: Joi.string().allow("", null),
  }).optional(),

  // ------------------------
  // 10. Social Media
  // ------------------------
  SocialMedia: Joi.array().items(
    Joi.object({
      // SocialMediaAsset: objectId().required(),
      _id: Joi.string().optional().allow("", null),
      SocialMediaAsset: Joi.string().allow("", null),
      // URL: Joi.string().uri().allow("", null),
      URL: Joi.string().allow("", null),
    })
  ),

  // ------------------------
  // 11. Layout Plan
  // ------------------------
  Lane: Joi.array()
    .items(
      Joi.object({
        LaneNumber: Joi.string().optional().allow("", null),
        LaneName: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  Hall: Joi.array()
    .items(
      Joi.object({
        HallNumber: Joi.string().optional().allow("", null),
        HallName: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  Floor: Joi.array()
    .items(
      Joi.object({
        FloorNumber: Joi.string().optional().allow("", null),
        FloorName: Joi.string().optional().allow("", null),
        _id: Joi.string().optional().allow("", null),
      })
    )
    .allow("", null)
    .optional(),
  // LayoutPlan: Joi.array().items(
  //   Joi.object({
  //     LaneNumber: Joi.string().allow("", null),
  //     LaneName: Joi.string().allow("", null),
  //     FloorNumber: Joi.string().allow("", null),
  //     FloorName: Joi.string().allow("", null),
  //     HallNumber: Joi.string().allow("", null),
  //     HallName: Joi.string().allow("", null),
  //   })
  // ),

  // ------------------------
  // 12. Visitors & Tickets
  // ------------------------
  MaxLimitOfVisitorsPerDay: Joi.number().integer().min(0),
  TodayVisitorCount: Joi.number().integer().min(0),
  TicketCharges: Joi.array().items(
    Joi.object({
      _id: Joi.string().optional().allow("", null),
      TicketCategory: Joi.string().allow("", null), // if ref then use objectId()
      TicketFee: Joi.number().min(0),
    })
  ),
  // OnlineBookingURL: Joi.string().uri().allow("", null),
  OnlineBookingURL: Joi.string().allow("", null),

  // ------------------------
  // 13. Authorized Representative
  // ------------------------
  AuthorizedRepresentativeName: Joi.string().allow("", null),
  AuthorizedRepresentativePhoneNo: Joi.string().allow("", null),
  AuthorizedRepresentativeWhatsApp: Joi.string().allow("", null),
  AuthorizedRepresentativeEmail: Joi.string().email().allow("", null),

  // ------------------------
  // 14. Office Address & Location
  // ------------------------
  OfficeAddress: Joi.string().allow("", null),
  OfficeGeoLocation: Joi.object({
    type: Joi.string().valid("Point").default("Point"),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }).optional(),

  // ------------------------
  // 15. Status & System Fields
  // ------------------------
  IsOpen: Joi.boolean().default(true),
  // LiveFeedURL: Joi.string().uri().allow("", null),
  LiveFeedURL: Joi.string().allow("", null),
  AllocatedQRCode: Joi.string().allow("", null),
  IsAccountLogin: Joi.boolean().default(false),
  Password: Joi.string().allow("", null), // used only if IsAccountLogin = true
  IsActive: Joi.boolean().default(true),

  // ------------------------
  // 16. Other Metadata
  // ------------------------
  CityIndicatorId: Joi.array().items(objectId()),
  // CityId: objectId().optional(),
  AssetType: Joi.string().allow("", null),

  // ------------------------
  // 17. Industry Relations
  // ------------------------
  Industry_Sector: objectId().optional(),
  Industry_Sub_Sector: objectId().optional(),

  // ------------------------
  // 18. Contact Details
  // ------------------------
  // Phone: Joi.number().optional(),
  Phone: Joi.number().allow("", null),
  EmailAddress: Joi.string().email().allow("", null),
  // Website: Joi.string().uri().allow("", null),
  // LinkedIn: Joi.string().uri().allow("", null),
  // Instagram: Joi.string().uri().allow("", null),
  // Facebook: Joi.string().uri().allow("", null),
  // Logo: Joi.string().uri().allow("", null),
  Logo: Joi.string().allow("", null),
}).unknown(false); // 🚨 no extra fields allowed

// Middleware
const validateSaveAssetMaster2 = (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.json(
      __requestResponse("400", {
        errorType: "Validation Error",
        error: error.details.map((d) => d.message).join(". "),
      })
    );
  }
  next();
};

module.exports = { validateSaveAssetMaster2 };
