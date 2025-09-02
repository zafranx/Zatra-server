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
        IsVerified: Boolean,
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
        AddressGeoLocation: {
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

        // 9. Business Mapping
        BrandsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        ODOPMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        VocalForLocal: { type: Boolean },
        ExportsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalCropsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalProductsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalSweetsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalSnacksMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalCuisineMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalSpicesMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],
        LocalFoodsMapping: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "Station_Speciality",
            },
        ],

        //10- MedicalSpecialities
        MedicalSpecialities: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "admin_lookups",
            },
        ],

        // 11- Service Packages
        Packages: [
            {
                PackageType: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                },
                Currency: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                },
                PakageTitle: String,
                PakageDescripton: String,
                PakagePrice: String,
                DiscountPrice: String,
                PakagePoster: String,
                PakageVideo: String,
                PictureGallery: [String],
                VideoGallery: [String],
            },
        ],

        // 12- MedicalSpecialities
        LiveFeedUrl: String,
        WebSiteUrl: String,
        WikipediaUrl: String,
        FacebookPageUrl: String,
        InstagramPageUrl: String,
        LinkedinPageUrl: String,
        YouTubeChannelUrl: String,
        WhatsAppCommunityUrl: String,
        TelegramUrl: String,
        QRCode: String,

        // 14.  Amenities
        Amenities: [
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
        // 15. Schedule
        BtvFrom: String,
        BtvTo: String,
        WeeklyOff: [String],
        OpeningTime: String,
        ClosingTime: String,
        MbtFrom: String,
        MbtTo: String,
        SpecialDarshansName: String,
        SpecialDarshansTime: String,
        Insturctions: String,
        NoOfVisitors: String,
        Advisory: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        // 16. Registration Fee
        RegistrationFeeCategoryAmount: [
            {
                FeeCategory: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                },
                Amount: String,
            },
        ],
        FeeCollectionLink: String,
        PaymentOrCode: String,
        AccountName: String,
        BankName: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        IFSCcode: String,
        AccountNumber: String,
        // 17. Call to action
        CallToAction: [
            {
                CallToActionType: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                },
                URL: String,
                Name: String,
                ContactNumber: String,
                EmailAddress: String,
            },
        ],

        // 18. Contact Information
        ContactName: String,
        ContactPhoneNumber: String,
        ContactEmailAddress: String,
        // 19. AdminLogin
        AdminLogin: [
            {
                Name: String,
                MobileNumber: String,
                Email: String,
                Password: String,
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
