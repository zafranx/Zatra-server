const mongoose = require("mongoose");
// EventMaster
const _SchemaDesign = new mongoose.Schema(
  {
    EventTypeId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
      // Event Type Values - Fair, Exhibition, Holy Trip
    },
    Category: String,
    EventTitle: String,
    StartDate: Date,
    EndDate: Date,
    Logo: String,
    EventOrganisers: [String],
    EventCatalogue: String,
    EventVenueType: String,
    Comments: String,
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("event_master", _SchemaDesign);

// create a table Event Master with the following fields - 
// Event ID (system generated), Event Type ID, Category, Event Title, 
// Start Date, End Date, Logo, Event Organisers, Event Catalogue
