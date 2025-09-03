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
