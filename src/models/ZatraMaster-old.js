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

const mongoose = require("mongoose");
// ZatraMaster
const _SchemaDesign = new mongoose.Schema(
  {
    // ZatraTypeId: {
    //   type: mongoose.SchemaTypes.ObjectId,
    //   ref: "admin_lookups",
    // },
    ZatraType: String,
    ZatraName: String,
    StartDate: Date,
    EndDate: Date,
    Logo: String,
    Website: String,
    ZatraOrganisers: String,
    // ⁠Enroute Cities (array)
    CityId: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
      },
    ],
    // ZatraCategoryId new field
    ZatraCategoryId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "admin_lookups",
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("zatra_master-old", _SchemaDesign);

// Create table ZATRA Master

// 1. ZATRA ID
// 2. ⁠ZATRA Name
// 3. ⁠ZATRA Type (Scheduled/ Ongoing)
// 4. ⁠Start Date
// 5. ⁠End Date
// 6. ⁠ZATRA Organiser
// 7. ⁠Enroute Cities (array) // ZatraCategory new field
