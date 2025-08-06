const mongoose = require("mongoose");
// ZatraMaster
const _SchemaDesign = new mongoose.Schema(
  {
    ZatraTypeId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" }, // ZATRA_TYPE_ID
    Name: { type: String, required: true }, // ZATRA Name
    ShortDescription: { type: String },
    LongDescription: { type: String },

    // Enroute Stations (states + cities from lookup)
    EnrouteStations: [
      {
        StateId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
        CityId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
      },
    ],

    // Organizers & Sponsors (linked to organizer_sponser_master)
    Organizers: [
      { type: mongoose.SchemaTypes.ObjectId, ref: "organizer_sponser_master" },
    ],
    Sponsors: [
      { type: mongoose.SchemaTypes.ObjectId, ref: "organizer_sponser_master" },
    ],

    // Organizer & Sponsor Admins (linked to zatra_login_master)
    OrganizerAdmins: [
      { type: mongoose.SchemaTypes.ObjectId, ref: "zatra_login_master" },
    ],
    SponsorAdmins: [
      { type: mongoose.SchemaTypes.ObjectId, ref: "zatra_login_master" },
    ],
    Logo: String, // URL of the logo image
    // Picture & Video Gallery
    PictureGallery: [String], // Array of image URLs
    VideoGallery: [String], // Array of video URLs

    // External Reference
    WikipediaPage: String,

    // Zatra Contacts
    ZatraContacts: [
      {
        Name: String,
        PhoneNumber: String,
        EmailAddress: String,
      },
    ],

    // Social Media
    ZatraSocialMedia: [
      {
        SocialMediaId: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "admin_lookups", // SOCIAL_MEDIA_ASSET
        },
        URL: String,
      },
    ],

    // Status & Timeline
    IsOngoing: { type: Boolean, default: false },
    StartDate: Date,
    EndDate: Date,

    // Instructions
    Instructions: String,

    // Registration Fee
    RegistrationFees: [
      {
        FeeCategory: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: "admin_lookups",
        },
        FeeAmount: Number,
      },
    ],

    RegistrationLink: String, // URL

    // ZATRA Admins (linked to zatra_login_master)
    ZatraAdmins: [
      { type: mongoose.SchemaTypes.ObjectId, ref: "zatra_login_master" },
    ],
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("zatra_master", _SchemaDesign);

// Create ZATRA (insert into ZATRA_MASTER)

// 1.	ZATRA_ID
// 2.	ZATRA_TYPE_ID
// 3.	Name
// 4.	Short Description
// 5.	Long Description
// 6.	Enroute Stations (Select multiple States from ZATRA_LOOKUP (Parent_Station_ID = “India”), Select multiple Cities from ZATRA_LOOKUP filtered by selected States)
// 7.	Organizers  with add more function (fields Organizer_Type_ID drop down, Name, Website, Contact Name, Contact Number, Email Address, IsSponsor = “No”) (Insert into ORGANIZER_SPONSOR_MASTER)
// 8.	Organizer_Admin with Add More (Name, Phone Number, Password) (insert into ZATRA_LOGIN Table)
// 9.	Sponsors with add more function (fields Organizer_Type_ID drop down, Name, Website, Contact Name, Contact Number, Email Address, IsSponsor = “Yes”) (Insert into ORGANIZER_SPONSOR_MASTER)
// 10.	Sponsor_Admin with Add More (Name, Phone Number, Password) (insert into ZATRA_LOGIN Table)
// 11.	Picture Gallery
// 12.	Video Gallery
// 13.	Wikipedia Page
// 14.	ZATRA Contacts with add more (Name, Phone Number, Email Address)
// 15.	ZATRA Social Media with add more (SOCIAL_MEDIA_ASSET dropdown, URL)
// 16.	IsOngoing (Boolean Yes/No)
// 17.	Start Date
// 18.	End Date
// 19.	Instructions
// 20.	Registration Fee with add more (Fee Category, Fee Amount)
// 21.	Registration Link (URL)
// 22.	ZATRA Admin with Add More (Name, Phone Number, Password) (insert into ZATRA_LOGIN Table)
