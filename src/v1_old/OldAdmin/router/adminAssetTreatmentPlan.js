const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { __CreateAuditLog } = require("../../../utils/auditlog");

const AssetTreatmentPlan = require("../../../models/AssetTreatmentPlan");
const {
  checkTreatmentPlan,
} = require("../Middleware/middleAssetTreatmentPlan");
const {
  __requestResponse,
  __deepClone,
  __formatDate,
  __formatDateddMMMyyyy,
} = require("../../../utils/constent");
const {
  __SUCCESS,
  __SOME_ERROR,
  __RECORD_NOT_FOUND,
  __VALIDATION_ERROR,
  __DATA_404,
} = require("../../../utils/variable");
let APIEndPointNo = "";

// Add API
// POST API to Save or Update Treatment Plan

router.post("/SaveTreatmentPlan", checkTreatmentPlan, async (req, res) => {
  const APIEndPointNo = "#KCC0005";
  try {
    const {
      treatmentPlan_id,
      AssetId,
      TreatmentDisplayName,
      TherapyId,
      Features,
      DisplayPrice,
      TreatmentPlanType,
      TreatmentPlanFile,
      TreatmentPlanBanner,
      TreatmentPlanImage,
      RateContactId,
    } = req.body;

    // Validate AssetId
    if (!AssetId || !mongoose.Types.ObjectId.isValid(AssetId)) {
      return res.status(400).json(__requestResponse("400", "Invalid AssetId"));
    }

    // Prepare treatment plan data
    const treatmentPlanData = {
      AssetId: mongoose.Types.ObjectId(AssetId),
      TreatmentDisplayName,
      TherapyId: TherapyId ? mongoose.Types.ObjectId(TherapyId) : null,
      Features: Features || [],
      DisplayPrice,
      TreatmentPlanType: TreatmentPlanType
        ? mongoose.Types.ObjectId(TreatmentPlanType)
        : null,
      TreatmentPlanFile,
      TreatmentPlanBanner,
      TreatmentPlanImage: TreatmentPlanImage || [],
      RateContactId: RateContactId
        ? mongoose.Types.ObjectId(RateContactId)
        : null,
    };

    // Check if we're creating a new treatment plan or updating an existing one
    let responseMessage;
    let newOrUpdatedPlan;

    if (!treatmentPlan_id) {
      // Create new Treatment Plan
      newOrUpdatedPlan = await AssetTreatmentPlan.create(treatmentPlanData);

      // Create audit log for adding
      __CreateAuditLog(
        "asset_treatment_plans",
        "TreatmentPlan.Add",
        null,
        null,
        treatmentPlanData,
        newOrUpdatedPlan._id,
        AssetId,
        null
      );

      responseMessage = "Treatment plan created successfully";
    } else {
      // Validate treatmentPlan_id
      if (!mongoose.Types.ObjectId.isValid(treatmentPlan_id)) {
        return res
          .status(400)
          .json(__requestResponse("400", "Invalid treatmentPlan_id"));
      }

      // Update existing Treatment Plan
      const existingPlan = await AssetTreatmentPlan.findOne({
        _id: treatmentPlan_id,
      });

      if (!existingPlan) {
        return res
          .status(404)
          .json(__requestResponse("404", "Treatment plan not found"));
      }

      await AssetTreatmentPlan.updateOne(
        { _id: treatmentPlan_id },
        { $set: treatmentPlanData }
      );

      // Create audit log for editing
      __CreateAuditLog(
        "asset_treatment_plans",
        "TreatmentPlan.Edit",
        null,
        existingPlan,
        treatmentPlanData,
        treatmentPlan_id,
        AssetId,
        null
      );

      newOrUpdatedPlan = await AssetTreatmentPlan.findById(treatmentPlan_id);
      responseMessage = "Treatment plan updated successfully";
    }

    // Return success response
    return res
      .status(200)
      .json(
        __requestResponse("200", __SUCCESS, responseMessage, newOrUpdatedPlan)
      );
  } catch (error) {
    return res
      .status(400)
      .json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
  }
});
// List API
router.post("/TreatmentPlanListx", async (req, res) => {
  try {
    const { AssetId } = req.body;

    if (!AssetId || !mongoose.Types.ObjectId.isValid(AssetId)) {
      return res.status(400).json(__requestResponse("400", "Invalid Asset ID"));
    }

    const treatmentPlans = await AssetTreatmentPlan.find({
      AssetId: mongoose.Types.ObjectId(AssetId),
    });

    return res
      .status(200)
      .json(__requestResponse("200", __SUCCESS, treatmentPlans));
  } catch (error) {
    return res.status(500).json(__requestResponse("500", __SOME_ERROR, error));
  }
});

// GET API to List Treatment Plans with populated fields
router.post("/GetTreatmentPlansx", async (req, res) => {
  const APIEndPointNo = "#KCC0006";
  const { AssetId } = req.body;
  console.log(req.body, "body 172 line");
  if (!AssetId || !mongoose.Types.ObjectId.isValid(AssetId)) {
    return res.status(400).json(__requestResponse("400", "Invalid Asset ID"));
  }
  try {
    // Fetch all treatment plans with populated fields
    const treatmentPlans = await AssetTreatmentPlan.find({
      AssetId: mongoose.Types.ObjectId(AssetId),
    })
      .populate("AssetId", "AssetName AssetTypeID") // Populate AssetId with specific fields
      .populate("TreatmentPlanType", "lookup_value") // Populate TreatmentPlanType with lookup_value
      .populate({
        path: "RateContactId",
        model: "contract_service_mappings", // Refers to the contract_service_mappings schema
        select:
          "ContractId ServiceId ServiceModeId TherapyId RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD IsActive DeliveryCharges ServiceCategoryId ServiceSubCategoryId IsDiscountAvailable IsPackageAvailable",
        populate: [
          {
            path: "ContractId",
            select: "ContractCode ContractDesc StartDate EndDate", // Fields to include from ContractId
          },
          {
            path: "ServiceId",
            select: "lookup_value", // Include fields from ServiceId
          },
          {
            path: "ServiceModeId",
            select: "lookup_value", // Include fields from ServiceModeId
          },
          {
            path: "TherapyId",
            select: "lookup_value", // Include fields from TherapyId
          },
          {
            path: "ServiceCategoryId",
            select: "lookup_value", // Include fields from ServiceCategoryId
          },
          {
            path: "ServiceSubCategoryId",
            select: "lookup_value", // Include fields from ServiceSubCategoryId
          },
        ],
      });

    // Return response with populated data
    return res
      .status(200)
      .json(__requestResponse("200", __SUCCESS, treatmentPlans));
  } catch (error) {
    return res
      .status(400)
      .json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
  }
});

// GET API to List Treatment Plans with populated fields
router.post("/GetTreatmentPlans", async (req, res) => {
  const APIEndPointNo = "#KCC0006";
  const { AssetId } = req.body;

  if (!AssetId || !mongoose.Types.ObjectId.isValid(AssetId)) {
    return res.status(400).json(__requestResponse("400", "Invalid Asset ID"));
  }

  try {
    // Fetch all treatment plans with populated fields
    const treatmentPlans = await AssetTreatmentPlan.find({
      AssetId: mongoose.Types.ObjectId(AssetId),
    })
      .populate("AssetId", "AssetName AssetTypeID") // Populate AssetId with specific fields
      .populate("TreatmentPlanType", "lookup_value") // Populate TreatmentPlanType with lookup_value
      .populate({
        path: "RateContactId",
        model: "contract_service_mappings", // Refers to the contract_service_mappings schema
        select:
          "ContractId ServiceId ServiceModeId TherapyId RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD IsActive DeliveryCharges ServiceCategoryId ServiceSubCategoryId IsDiscountAvailable IsPackageAvailable",
        populate: [
          {
            path: "ContractId",
            select: "ContractCode ContractDesc StartDate EndDate", // Fields to include from ContractId
          },
          {
            path: "ServiceId",
            select: "lookup_value",
          },
          {
            path: "ServiceModeId",
            select: "lookup_value",
          },
          {
            path: "TherapyId",
            select: "lookup_value",
          },
          {
            path: "ServiceCategoryId",
            select: "lookup_value",
          },
          {
            path: "ServiceSubCategoryId",
            select: "lookup_value",
          },
        ],
      });

    // Map the treatment plans to include the RateContract string
    const mappedPlans = treatmentPlans.map((plan) => {
      const rateContact = plan.RateContactId;

      const rateContractDetails = rateContact
        ? {
            _id: rateContact._id,
            RateContract: `| Service - ${
              rateContact.ServiceId?.lookup_value || "N/A"
            } | ServiceMode - ${
              rateContact.ServiceModeId?.lookup_value || "N/A"
            } | Therapy - ${
              rateContact.TherapyId?.lookup_value || "N/A"
            } | ServiceCategory - ${
              rateContact.ServiceCategoryId?.lookup_value || "N/A"
            } | ServiceSubCategory - ${
              rateContact.ServiceSubCategoryId?.lookup_value || "N/A"
            } | Charges - Rate INR - ${
              rateContact.RateINR || "N/A"
            }, Rate USD - ${rateContact.RateUSD || "N/A"}, MRP INR - ${
              rateContact.MRPINR || "N/A"
            }, MRP USD - ${rateContact.MRPUSD || "N/A"}, Offer INR - ${
              rateContact.OfferINR || "N/A"
            }, Offer USD - ${rateContact.OfferUSD || "N/A"}`,
          }
        : null;

      return {
        ...plan.toObject(),
        RateContract: rateContractDetails,
      };
    });

    // Return response with populated data and new RateContract field
    return res
      .status(200)
      .json(__requestResponse("200", __SUCCESS, mappedPlans));
  } catch (error) {
    return res
      .status(400)
      .json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
  }
});

// not in use
router.post("/GetAllTreatmentPlans", async (req, res) => {
  const APIEndPointNo = "#KCC0006";
  // const { AssetId } = req.body;

  try {
    // Fetch all treatment plans with populated fields
    const treatmentPlans = await AssetTreatmentPlan.find()
      .populate("AssetId", "AssetName AssetTypeID")
      .populate("TreatmentPlanType", "lookup_value") // Populate TreatmentPlanType with lookup_value
      .populate({
        path: "RateContactId",
        model: "contract_service_mappings", // Refers to the contract_service_mappings schema
        select:
          "ContractId ServiceId ServiceModeId TherapyId RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD IsActive DeliveryCharges ServiceCategoryId ServiceSubCategoryId IsDiscountAvailable IsPackageAvailable",
        populate: [
          {
            path: "ContractId",
            select: "ContractCode ContractDesc StartDate EndDate", // Fields to include from ContractId
          },
          {
            path: "ServiceId",
            select: "lookup_value description", // Include fields from ServiceId
          },
          {
            path: "ServiceModeId",
            select: "lookup_value description", // Include fields from ServiceModeId
          },
          {
            path: "TherapyId",
            select: "lookup_value description", // Include fields from TherapyId
          },
          {
            path: "ServiceCategoryId",
            select: "lookup_value description", // Include fields from ServiceCategoryId
          },
          {
            path: "ServiceSubCategoryId",
            select: "lookup_value description", // Include fields from ServiceSubCategoryId
          },
        ],
      });

    // Return response with populated data
    return res
      .status(200)
      .json(__requestResponse("200", __SUCCESS, treatmentPlans));
  } catch (error) {
    return res
      .status(400)
      .json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
  }
});

module.exports = router;
