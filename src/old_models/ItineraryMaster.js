const mongoose = require("mongoose");

const SchemaDesign = new mongoose.Schema(
    {
        UserID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user_masters",
        },
        ItineraryID: {
            type: String,
        },
        FromDate: {
            type: Date,
        },
        ToDate: {
            type: Date,
        },
        Guests: [
            {
                Name: String,
                Age: Number,
                Gender: String,
                SpecialRemarks: String,
            },
        ],
        // Added by Saurabh 10-04-2025
        // start
        TotalAdultsPassangers: {
            type: Number,
            default: 0,
        },
        TotalChildrenPassangers: {
            type: Number,
            default: 0,
        },
        // end

        TripID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "trip_masters",
        },
        EventID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "event_masters",
        },
        Destinations: [
            {
                // Added by Saurabh 10-04-2025
                // start
                CityId: {
                    type: mongoose.SchemaTypes.ObjectId,
                    ref: "admin_lookups",
                },
                CheckIN: {
                    type: Date,
                    default: null,
                },
                CheckOut: {
                    type: Date,
                    default: null,
                },
                GuestHousesOrHotels: {
                    type: Array,
                },
                // end
            },
        ],
    },
    {
        timestamps: true,
    }
);
SchemaDesign.pre("save", async function (next) {
    try {
        if (!this.ItineraryID) {
            const Doucments = mongoose.model("itinerary_masters", SchemaDesign);
            const count = await Doucments.countDocuments();
            this.ItineraryID = `BH-${("0000" + (count + 1)).slice(-5)}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});
module.exports = mongoose.model("itinerary_masters", SchemaDesign);
