const mongoose = require("mongoose");

// ASSET MASTER SCHEMA
const _SchemaDesign = new mongoose.Schema(
    {
        // 1. Identifier
        AssetName: String,
        IsDestination: { type: Boolean, default: false },
        ZatraId: {
            type: mongoose.SchemaTypes.ObjectId,
            // ref: "admin_lookups",
        },
        StationId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        ParentAssetId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_master",
        },
        NearbyAssetIds: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "asset_master2",
            },
        ],

        // 2. Categorization
        PanchtatvaCategoryLevel1_Id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        PanchtatvaCategoryLevel2_Id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        PanchtatvaCategoryLevel3_Id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        // 3. Establishment Type
        EstablishmentId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },

        // 4. Incorporation Details
        LegalStatusId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        RegistrationBodyId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        RegistrationNumber: String,
        GST: String,
        PAN: String,

        // 5. Verification Details (Radio Button - Pass, Fail, in Process, Not Applicable)
        CriminalRecord: String,
        CompanyIncorporation: String,
        CIBILRecord: String,
        BusinessIntegrity: String,
        FinancialIntegrity: String,
        OnlineReputation: String,
        VerificationEntity: String,
        VerificationReport: String,
        VerificationDatetime: String,
        // 6. Layout Plan
        Layout: [
            {
                LaneFloorNumber: String,
                LaneFloorName: String,
                HallNumber: String,
                HallName: String,
                NoOfBoots: String,
            },
        ],
        // 6. Address & Geolocation
        AddressLine1: String,
        AddressLine2: String,
        PostalCode: String,
        LaneFloorName: String,
        LaneFloorNumber: String,
        HallName: String,
        HallNumber: String,
        AllocationBoothNumber: String,
        Geolocation: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], required: true }, // [lng, lat]
        },
        // 7. Profile Description
        ProfilePicture: String,
        PictureGallery: [String],
        VideoGallery: [String],
        ShortDescription: String,
        LongDescription: String,

        // 8. Business Details
        IndustrySectorId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        SubIndustrySectorId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        AssetType: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        MinInvestments: String,
        AssuredRois: String,

        // 2. Destination & Establishment

        PanchtatvaSubCategoryId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        Panchtatva_Sub_Sub_CategoryId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },

        DestinationName: String,

        // 3. Legal Entity
        LegalEntityTypeId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        LegalEntityName: String,
        Registration_Number: String,

        Registration_Address: String,

        // 4. Verification
        IsVerified: { type: Boolean, default: false },
        VerificationReport: String,
        VerifiedBy: { type: String, default: "" },
        VerificationDate: { type: Date },

        // 5. Allocation & Layout
        AllocationNumber: String, // Shop No, Booth No
        Lane: String,
        LaneNumber: String,
        Floor: String,
        FloorNumber: String,
        Hall: String,
        HallNumber: String,

        // 7. Descriptions

        // 8. Media

        // 9. Timings & Hours
        OpeningDays: [String], // Sunday - Saturday
        OpeningTime: String,
        ClosingTime: String,
        DayBreakTime: String, // Example: 1:00 PM - 2:00 PM
        BusinessHours: { from: String, to: String },
        GeneralPublicHour: { from: String, to: String },

        // 10. Social Media
        SocialMedia: [
            {
                SocialMediaAsset: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                },
                URL: String,
            },
        ],

        // 11. Layout Plan
        // LayoutPlan: [
        //   {
        //     LaneNumber: String,
        //     LaneName: String,
        //     FloorNumber: String,
        //     FloorName: String,
        //     HallNumber: String,
        //     HallName: String,
        //   },
        // ],
        Lane: [
            {
                LaneNumber: String,
                LaneName: String,
            },
        ],
        Hall: [
            {
                HallNumber: String,
                HallName: String,
            },
        ],
        Floor: [
            {
                FloorNumber: String,
                FloorName: String,
            },
        ],

        // 12. Visitors & Tickets
        MaxLimitOfVisitorsPerDay: Number,
        TodayVisitorCount: Number,
        TicketCharges: [
            {
                TicketCategory: String,
                TicketFee: Number,
            },
        ],
        OnlineBookingURL: String,

        // 13. Authorized Representative
        AuthorizedRepresentativeName: String,
        AuthorizedRepresentativePhoneNo: String,
        AuthorizedRepresentativeWhatsApp: String,
        AuthorizedRepresentativeEmail: String,

        // 14. Office Address & Location
        OfficeAddress: String,
        OfficeGeoLocation: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number] },
        },

        // 15. Status & System Fields
        IsOpen: { type: Boolean, default: true },
        LiveFeedURL: String,
        AllocatedQRCode: String,
        IsAccountLogin: { type: Boolean, default: false },
        IsActive: { type: Boolean, default: true },

        // 16. Other Metadata
        CityIndicatorId: [
            { type: mongoose.SchemaTypes.ObjectId, ref: "city_indicator" },
        ],
        // CityId: { type: mongoose.SchemaTypes.ObjectId, ref: "admin_lookups" },
        // DestinationId: {
        //   type: mongoose.SchemaTypes.ObjectId,
        //   ref: "destination_master",
        // },

        // 17. Industry Relations
        Industry_Sector: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        Industry_Sub_Sector: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },

        // 18. Contact Details : Authorized Representative
        Phone: Number,
        EmailAddress: String,
        // Website: String,
        // LinkedIn: String,
        // Instagram: String,
        // Facebook: String,

        // 19. Destination Amenities
        DestinationAmenities: [
            {
                AmenityId: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                }, // from AMENITIES_MASTER
                GeoLocation: {
                    type: { type: String, enum: ["Point"], default: "Point" },
                    coordinates: { type: [Number] }, // [lng, lat]
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("asset_master2", _SchemaDesign);

// give by gourav sir
// ASSET_MASTER

// 1.	STATION_ID
// 2.	ASSET_ID
// 3.	PARENT_ASSET_ID
// 4.	IS_DESTINATION (boolean Yes/No)
// 5.	ESTABLISHMENT_ID (drop down)
// 6.	PANCHTATVA_ CATEGORY _ID (drop down)
// 7.	INDUSTRY_ID (drop down)
// 8.	DESTINATION_NAME
// 9.	LEGAL_ENTITY_TYPE_ID (drop down)
// 10.	LEGAL_ENTITY_NAME
// 11.	REGISTRATION_NUMBER
// 12.	GST_NUMBER
// 13.	PAN_NUMBER
// 14.	IS_VERIFIED (Boolean Yes/No)
// 15.	VERIFICATION_REPORT
// 16.	VERIFIED_BY
// 17.	VERIFICATION_DATE
// 18.	ALLOCATION_NUMBER (Shop No, Booth No)
// 19.	LANE_NUMBER
// 20.	FLOOR_NUMBER
// 21.	HALL_NUMBER
// 22.	ADDRESS (Address Line 1, Address Line 2, Postal Code)
// 23.	GEOLOCATION
// 24.	Short Description
// 25.	Long Description
// 26.	Picture Gallery
// 27.	Video Gallery
// 28.	Opening Days (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)
// 29.	Opening Time (Clock)
// 30.	Closing Time (Clock)
// 31.	Day Break Time (Textbox sample value 1:00 PM to 2:00 PM)
// 32.	Business_Hours (from time - to time)
// 33.	General_Public_Hour (from time - to time)
// 34.	Social_Media with add more (SOCIAL_MEDIA_ASSET dropdown, URL)
// 35.	Layout_Plan with add more options (Lane Number, Lane Name, Floor Number, Floor Name, Hall Number, Hall Name)
// 36.	Max_Limit_of_Visitors_per_day (number)
// 37.	Today_VISITOR_Count (number)
// 38.	Ticket_Charges with add more (Ticket Category, Ticket Fee)
// 39.	Online_Booking_URL (URL)
// 40.	Authorized_Representative_Name
// 41.	Authorized_Representative_Phone_No
// 42.	Authorized_Representative_WhatsApp (default value same as Phone no)
// 43.	Authorized_Representative_Email
// 44.	Office_Address (Textbox)
// 45.	Office_GeoLocation
// 46.	IS_OPEN (Boolean Yes/No),
// 47.	DESTINATION Admin with Add More (Name, Phone Number, Password) (insert into ZATRA_LOGIN Table)
// 48.	DESTINATION_AMENITIES with Add More (Amenity Type (drop down from AMENITIES_MASTER (field AMENITY_ID), GeoLocation)
//  LIVE_FEED_URL, Allocated_QR_CODE;
