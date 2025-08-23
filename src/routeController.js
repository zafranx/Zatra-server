const V1 = {
  APP_ROUTE: [
    require("./v1/app/router/app.ZatraList"),
    require("./v1/app/router/app.CityContactList"),
    require("./v1/app/router/app.auth"),
  ],
  ADMIN_ROUTE: [
    require("./v1/Admin/router/admin.lookup"),
    require("./v1/Admin/router/admin.address"),
    require("./v1/Admin/router/admin.EventMaster"),
    require("./v1/Admin/router/admin.AssetMaster"),
    require("./v1/Admin/router/admin.AssetUser"),
    require("./v1/Admin/router/admin.brandMaster"),
    require("./v1/Admin/router/admin.productMaster"),
    require("./v1/Admin/router/admin.ZatraMaster"),
    require("./v1/Admin/router/admin.DestinationMaster"),
    require("./v1/Admin/router/admin.CityContacts"),
    // require("./v1/Admin/router/admin.Helpline"),
    require("./v1/Admin/router/admin.GovtPolicy"),
    require("./v1/Admin/router/admin.ProjectMaster"),
    require("./v1/Admin/router/admin.AncillaryServices"),
    require("./v1/Admin/router/admin.DestinationAmenities"),
    require("./v1/Admin/router/admin.CityIndicator"),
    require("./v1/Admin/router/admin.ODOPMaster"),
    require("./v1/Admin/router/admin.UserMaster"),
    require("./v1/Admin/router/admin.ZatraLogin"),
    require("./v1/Admin/router/admin.OrganizerSponser"),
    require("./v1/Admin/router/admin.AssetMaster2"),
  ],
  COMMON_ROUTE: [
    require("./v1/Common/router/lookup"),
    require("./v1/Common/router/imageUpload"),
  ],
  // WEBSITE_ROUTE: [
  //     // require("./v1/web/router/AssetList"),
  // ],
};
module.exports = { V1 };
