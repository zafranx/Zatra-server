const express = require("express");
const { default: mongoose } = require("mongoose");
const router = express.Router();
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

const tlbContract = require("../../../models/Contracts");
const tlbContractMapping = require("../../../models/ContractServiceMapping");
const { __ContractCode } = require("../../../utils/contractcode");
const {
  checkContractInput,
  checkContractRateMap,
} = require("../../Admin/Middleware/middlecontract");
const { array } = require("joi");
const { __CreateAuditLog } = require("../../../utils/auditlog");
let APIEndPointNo = "";

router.post("/SaveContract", checkContractInput, async (req, res) => {
  try {
    APIEndPointNo = "#KCC0004";
    const {
      contract_desc,
      contract_id,
      asset_id,
      start_date,
      end_date,
      is_current,
      contract_type_id,
      document,
    } = req.body;

    if (contract_id) {
      //Update the contract basis contractId
      const _oldrec = await tlbContract.findOne({ _id: contract_id });
      if (!_oldrec) {
        return res.json(__requestResponse("400", "No such contract found."));
      }
      const _ContractData = {
        ContractDesc: contract_desc,
        StartDate: start_date,
        EndDate: end_date,
        isCurrent: is_current,
        ContractTypeId: mongoose.Types.ObjectId(contract_type_id),
        Documents: document,
      };
      const _updateContract = await tlbContract.updateOne(
        { _id: contract_id },
        {
          $set: _ContractData,
        }
      );

      if (_updateContract) {
        __CreateAuditLog(
          "contracts",
          "Contract.Edit",
          null,
          _oldrec,
          _ContractData,
          contract_id,
          null,
          null
        );
        return res
          .json(__requestResponse("200", __SUCCESS, _updateContract))
          .status(200);
      }
    } else {
      //Insert the new contract for the asset
      let _contractCode = await __ContractCode();
      const _ContractData = {
        ContractCode: _contractCode,
        AssetId: mongoose.Types.ObjectId(asset_id),
        StartDate: start_date,
        EndDate: end_date,
        IsExpired: false,
        isCurrent: is_current,
        ContractDesc: contract_desc,
        ContractTypeId: mongoose.Types.ObjectId(contract_type_id),
        Documents: document,
      };

      await tlbContract
        .create(_ContractData)
        .then((x) => {
          __CreateAuditLog(
            "contracts",
            "Contract.Add",
            null,
            null,
            _ContractData,
            x._id,
            null,
            null
          );
          return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
        })
        .catch((error) => {
          return res.json(
            __requestResponse(
              "501",
              __SOME_ERROR,
              "Error Code: " + APIEndPointNo + "_1" + error
            )
          );
        });
    }
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

router.post("/ContractList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0005";
    const { client_id } = req.body;
    const PopulateClient = new Array();
    PopulateClient.push({
      path: "AssetId",
      select: "AssetName",
    });
    PopulateClient.push({
      path: "ContractTypeId",
      select: "lookup_value",
    });

    const list = await tlbContract
      .find(
        { AssetId: client_id },
        "ContractCode ContractDesc StartDate EndDate IsExpired isCurrent Documents"
      )
      .populate(PopulateClient);
    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    console.log(list);
    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          ...item,
          StartDate: item.StartDate && __formatDateddMMMyyyy(item.StartDate),
          EndDate: item.EndDate && __formatDateddMMMyyyy(item.EndDate),
        }))
      )
    );
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

// router.post("/SaveRateContractx", checkContractRateMap, async (req, res) => {
//   try {
//     APIEndPointNo = "#KCC0006";
//     const { rate_contracts } = req.body;

//     if (Array.isArray(rate_contracts)) {
//       rate_contracts.map(async (x) => {
//         const {
//           contract_service_id,
//           contract_id,
//           service_id,
//           service_mode_id,
//           rate_type_id,
//           therapy_id,
//           rate_inr,
//           rate_usd,
//           mrp_inr,
//           mrp_usd,
//           offer_inr,
//           offer_usd,
//           is_active,
//           service_category_id,
//           service_sub_category_id,
//           is_discount_available,
//           is_package_available,
//         } = x;
//         if (contract_service_id) {
//           //update the contract service rate mapping
//           const _oldrec = await tlbContractMapping.findOne({
//             _id: contract_service_id,
//           });
//           if (!_oldrec) {
//             return res.json(
//               __requestResponse(
//                 "400",
//                 "No record found. Please review the request object.",
//                 x
//               )
//             );
//           }
//           const _updateData = {
//             ContractId: contract_id,
//             ServiceId: service_id,
//             ServiceModeId: service_mode_id,
//             RateTypeId: rate_type_id,
//             TherapyId: therapy_id,
//             RateINR: rate_inr,
//             RateUSD: rate_usd,
//             MRPINR: mrp_inr,
//             MRPUSD: mrp_usd,
//             OfferINR: offer_inr,
//             OfferUSD: offer_usd,
//             IsActive: is_active,
//             ServiceCategoryId: service_category_id,
//             ServiceSubCategoryId: service_sub_category_id,
//             IsDiscountAvailable: is_discount_available,
//             IsPackageAvailable: is_package_available,
//           };
//           const _update = await tlbContractMapping.updateOne(
//             {
//               _id: contract_service_id,
//             },
//             {
//               $set: _updateData,
//             }
//           );
//           __CreateAuditLog(
//             "contract_service_mapping",
//             "CSM.Edit",
//             null,
//             _oldrec ? _oldrec : null,
//             _updateData,
//             contract_service_id,
//             null,
//             null
//           );
//           return res.json(__requestResponse("200", __SUCCESS, _update));
//         } else {
//           //Insert the conctract service rate mapping
//           const _updateData = {
//             ContractId: contract_id,
//             ServiceId: service_id,
//             ServiceModeId: service_mode_id,
//             RateTypeId: rate_type_id,
//             RateINR: rate_inr,
//             RateUSD: rate_usd,
//             TherapyId: therapy_id,
//             MRPINR: mrp_inr,
//             MRPUSD: mrp_usd,
//             OfferINR: offer_inr,
//             OfferUSD: offer_usd,
//             IsActive: is_active,
//             ServiceCategoryId: service_category_id,
//             ServiceSubCategoryId: service_sub_category_id,
//             IsDiscountAvailable: is_discount_available,
//             IsPackageAvailable: is_package_available,
//           };
//           await tlbContractMapping.create(_updateData).then((x) => {
//             __CreateAuditLog(
//               "contract_service_mapping",
//               "CSM.Add",
//               null,
//               null,
//               _updateData,
//               x._id,
//               null,
//               null
//             );
//             return res.json(__requestResponse("200", __SUCCESS, x)).status(200);
//           });
//         }
//       });
//     } else {
//       return res.json(
//         __requestResponse("400", "Request object must of array type.")
//       );
//     }
//   } catch (error) {
//     return res.json(
//       __requestResponse(
//         "400",
//         __SOME_ERROR,
//         "Error Code: " + APIEndPointNo + "_0.1:" + error
//       )
//     );
//   }
// });

// with validation for service category and service su  category
router.post("/SaveRateContract2", checkContractRateMap, async (req, res) => {
  const APIEndPointNo = "#KCC0006";

  try {
    const { rate_contracts } = req.body;

    // Check if rate_contracts is an array
    if (!Array.isArray(rate_contracts)) {
      return res.json(
        __requestResponse("400", "Request object must be of array type.")
      );
    }

    // Prepare an array of promises for all insert/update operations
    const operations = rate_contracts.map(async (x) => {
      const {
        contract_service_id,
        contract_id,
        service_id,
        service_mode_id,
        rate_type_id,
        therapy_id,
        rate_inr,
        rate_usd,
        mrp_inr,
        mrp_usd,
        offer_inr,
        offer_usd,
        is_active,
        service_category_id,
        service_sub_category_id,
        is_discount_available,
        is_package_available,
      } = x;

      try {
        // Validate inputs based on the condition: if 'is_package_available' is true, 'service_category_id' and 'service_sub_category_id' are required
        if (is_package_available) {
          if (!service_category_id) {
            return {
              status: 400,
              message: "Service Category is required",
              data: x,
            };
          }
          if (!service_sub_category_id) {
            return {
              status: 400,
              message: "Service Sub Category is required",
              data: x,
            };
          }
        }

        if (contract_service_id) {
          // Update existing contract service rate mapping
          const _oldrec = await tlbContractMapping.findOne({
            _id: contract_service_id,
          });

          if (!_oldrec) {
            return {
              status: 400,
              message: "No record found. Please review the request object.",
              data: x,
            };
          }

          const _updateData = {
            ContractId: contract_id,
            ServiceId: service_id,
            ServiceModeId: service_mode_id,
            RateTypeId: rate_type_id,
            TherapyId: therapy_id,
            RateINR: rate_inr,
            RateUSD: rate_usd,
            MRPINR: mrp_inr,
            MRPUSD: mrp_usd,
            OfferINR: offer_inr,
            OfferUSD: offer_usd,
            IsActive: is_active,
            ServiceCategoryId: service_category_id,
            ServiceSubCategoryId: service_sub_category_id,
            IsDiscountAvailable: is_discount_available,
            IsPackageAvailable: is_package_available,
          };

          await tlbContractMapping.updateOne(
            { _id: contract_service_id },
            { $set: _updateData }
          );

          __CreateAuditLog(
            "contract_service_mapping",
            "CSM.Edit",
            null,
            _oldrec,
            _updateData,
            contract_service_id,
            null,
            null
          );

          return { status: 200, message: __SUCCESS, data: _updateData };
        } else {
          // Insert new contract service rate mapping
          const _newData = {
            ContractId: contract_id,
            ServiceId: service_id,
            ServiceModeId: service_mode_id,
            RateTypeId: rate_type_id,
            RateINR: rate_inr,
            RateUSD: rate_usd,
            TherapyId: therapy_id,
            MRPINR: mrp_inr,
            MRPUSD: mrp_usd,
            OfferINR: offer_inr,
            OfferUSD: offer_usd,
            IsActive: is_active,
            ServiceCategoryId: service_category_id,
            ServiceSubCategoryId: service_sub_category_id,
            IsDiscountAvailable: is_discount_available,
            IsPackageAvailable: is_package_available,
          };

          const newRecord = await tlbContractMapping.create(_newData);

          __CreateAuditLog(
            "contract_service_mapping",
            "CSM.Add",
            null,
            null,
            _newData,
            newRecord._id,
            null,
            null
          );

          return { status: 200, message: __SUCCESS, data: newRecord };
        }
      } catch (err) {
        return {
          status: 400,
          message: `Error processing record: ${err.message}`,
          data: x,
        };
      }
    });

    // Wait for all promises to resolve
    const results = await Promise.all(operations);

    // Send a single response after all operations are complete
    return res.json(__requestResponse("200", __SUCCESS, results));
  } catch (error) {
    console.error("Error in SaveRateContract:", error);
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
      )
    );
  }
});

router.post("/SaveRateContract3", checkContractRateMap, async (req, res) => {
  const APIEndPointNo = "#KCC0006";

  try {
    const { rate_contracts } = req.body;

    // Check if rate_contracts is an array
    if (!Array.isArray(rate_contracts)) {
      return res.json(
        __requestResponse("400", "Request object must be of array type.")
      );
    }

    // Prepare an array of promises for all insert/update operations
    const operations = rate_contracts.map(async (x) => {
      const {
        contract_service_id,
        contract_id,
        service_id,
        service_mode_id,
        rate_type_id,
        therapy_id,
        rate_inr,
        rate_usd,
        mrp_inr,
        mrp_usd,
        offer_inr,
        offer_usd,
        is_active,
        service_category_id,
        service_sub_category_id,
        is_discount_available,
        is_package_available,
      } = x;

      try {
        if (contract_service_id) {
          // Update existing contract service rate mapping
          const _oldrec = await tlbContractMapping.findOne({
            _id: contract_service_id,
          });

          if (!_oldrec) {
            return {
              status: 400,
              message: "No record found. Please review the request object.",
              data: x,
            };
          }

          const _updateData = {
            ContractId: contract_id,
            ServiceId: service_id,
            ServiceModeId: service_mode_id,
            RateTypeId: rate_type_id,
            TherapyId: therapy_id,
            RateINR: rate_inr,
            RateUSD: rate_usd,
            MRPINR: mrp_inr,
            MRPUSD: mrp_usd,
            OfferINR: offer_inr,
            OfferUSD: offer_usd,
            IsActive: is_active,
            ServiceCategoryId: service_category_id,
            ServiceSubCategoryId: service_sub_category_id,
            IsDiscountAvailable: is_discount_available,
            IsPackageAvailable: is_package_available,
          };

          await tlbContractMapping.updateOne(
            { _id: contract_service_id },
            { $set: _updateData }
          );

          __CreateAuditLog(
            "contract_service_mapping",
            "CSM.Edit",
            null,
            _oldrec,
            _updateData,
            contract_service_id,
            null,
            null
          );

          return { status: 200, message: __SUCCESS, data: _updateData };
        } else {
          // Insert new contract service rate mapping
          const _newData = {
            ContractId: contract_id,
            ServiceId: service_id,
            ServiceModeId: service_mode_id,
            RateTypeId: rate_type_id,
            RateINR: rate_inr,
            RateUSD: rate_usd,
            TherapyId: therapy_id,
            MRPINR: mrp_inr,
            MRPUSD: mrp_usd,
            OfferINR: offer_inr,
            OfferUSD: offer_usd,
            IsActive: is_active,
            ServiceCategoryId: service_category_id,
            ServiceSubCategoryId: service_sub_category_id,
            IsDiscountAvailable: is_discount_available,
            IsPackageAvailable: is_package_available,
          };

          const newRecord = await tlbContractMapping.create(_newData);

          __CreateAuditLog(
            "contract_service_mapping",
            "CSM.Add",
            null,
            null,
            _newData,
            newRecord._id,
            null,
            null
          );

          return { status: 200, message: __SUCCESS, data: newRecord };
        }
      } catch (err) {
        return {
          status: 400,
          message: `Error processing record: ${err.message}`,
          data: x,
        };
      }
    });

    // // Wait for all promises to resolve
    // const results = await Promise.all(operations);
    // // Send a single response after all operations are complete
    // return res.json(__requestResponse("200", __SUCCESS, results));

    // Wait for all promises to resolve and handle both successes and errors
    const results = await Promise.allSettled(operations);
console.log(results,"results")
    // Format the response
    const response = results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : { status: 400, message: result.reason }
    );

    // Send the final response after all operations are complete
    return res.json(__requestResponse("200", __SUCCESS, response));

  } catch (error) {
    console.error("Error in SaveRateContract:", error);
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
      )
    );
  }
});

router.post("/SaveRateContract", checkContractRateMap, async (req, res) => {
  const APIEndPointNo = "#KCC0006";
  let isResponseSent = false; // Flag to track if the response is sent

  try {
    const { rate_contracts } = req.body;

    // Check if rate_contracts is an array
    if (!Array.isArray(rate_contracts)) {
      if (!isResponseSent) {
        isResponseSent = true;
        return res.json(
          __requestResponse("400", "Request object must be of array type.")
        );
      }
    }

    // Prepare an array of promises for all insert/update operations
    const operations = rate_contracts.map(async (x) => {
      const {
        contract_service_id,
        contract_id,
        service_id,
        service_mode_id,
        rate_type_id,
        therapy_id,
        rate_inr,
        rate_usd,
        mrp_inr,
        mrp_usd,
        offer_inr,
        offer_usd,
        delivery_charges,
        is_active,
        service_category_id,
        service_sub_category_id,
        is_discount_available,
        is_package_available,
      } = x;

      try {
        // // Validation for package category fields
        // if (is_package_available) {
        //   if (!service_category_id) {
        //     return {
        //       status: 400,
        //       message: "Service Category is required for packages.",
        //       data: x,
        //     };
        //   }
        //   if (!service_sub_category_id) {
        //     return {
        //       status: 400,
        //       message: "Service Sub Category is required for packages.",
        //       data: x,
        //     };
        //   }
        // }

        if (contract_service_id) {
          // Update existing contract service rate mapping
          const _oldrec = await tlbContractMapping.findOne({
            _id: contract_service_id,
          });
          if (!_oldrec) {
            return {
              status: 400,
              message: "No record found. Please review the request object.",
              data: x,
            };
          }

          const _updateData = {
            ContractId: contract_id,
            ServiceId: service_id,
            ServiceModeId: service_mode_id,
            RateTypeId: rate_type_id,
            TherapyId: therapy_id,
            RateINR: rate_inr,
            RateUSD: rate_usd,
            MRPINR: mrp_inr,
            MRPUSD: mrp_usd,
            OfferINR: offer_inr,
            OfferUSD: offer_usd,
            DeliveryCharges: delivery_charges,
            IsActive: is_active,
            ServiceCategoryId: service_category_id,
            ServiceSubCategoryId: service_sub_category_id,
            IsDiscountAvailable: is_discount_available,
            IsPackageAvailable: is_package_available,
          };

          await tlbContractMapping.updateOne(
            { _id: contract_service_id },
            { $set: _updateData }
          );

          __CreateAuditLog(
            "contract_service_mapping",
            "CSM.Edit",
            null,
            _oldrec,
            _updateData,
            contract_service_id,
            null,
            null
          );

          return { status: 200, message: __SUCCESS, data: _updateData };
        } else {
          // Insert new contract service rate mapping
          const _newData = {
            ContractId: contract_id,
            ServiceId: service_id,
            ServiceModeId: service_mode_id,
            RateTypeId: rate_type_id,
            RateINR: rate_inr,
            RateUSD: rate_usd,
            TherapyId: therapy_id,
            MRPINR: mrp_inr,
            MRPUSD: mrp_usd,
            OfferINR: offer_inr,
            OfferUSD: offer_usd,
            DeliveryCharges: delivery_charges,
            IsActive: is_active,
            ServiceCategoryId: service_category_id,
            ServiceSubCategoryId: service_sub_category_id,
            IsDiscountAvailable: is_discount_available,
            IsPackageAvailable: is_package_available,
          };

          const newRecord = await tlbContractMapping.create(_newData);

          __CreateAuditLog(
            "contract_service_mapping",
            "CSM.Add",
            null,
            null,
            _newData,
            newRecord._id,
            null,
            null
          );

          return { status: 200, message: __SUCCESS, data: newRecord };
        }
      } catch (err) {
        return {
          status: 400,
          message: `Error processing record: ${err.message}`,
          data: x,
        };
      }
    });

    const results = await Promise.allSettled(operations);

    // Only send a response once
    if (!isResponseSent) {
      isResponseSent = true;
      const response = results.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : { status: 400, message: result.reason }
      );
      return res.json(__requestResponse("200", __SUCCESS, response));
    }
  } catch (error) {
    if (!isResponseSent) {
      isResponseSent = true;
      console.error("Error in SaveRateContract:", error);
      return res.json(
        __requestResponse(
          "400",
          __SOME_ERROR,
          `Error Code: ${APIEndPointNo}_0.1: ${error.message}`
        )
      );
    }
  }
});

router.post("/ContractRateMapList", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0006";
    const { contract_id } = req.body;
    const popKeys = new Array();
    popKeys.push({
      path: "ContractId",
      select: "ContractCode ContractDesc StartDate EndDate",
      // path: "ContractId",
      // select:
      //   "ContractCode ContractDesc StartDate EndDate AssetId IsExpired IsCurrent",
      // populate: {
      //   path: "AssetId",
      //   select: "AssetName",
      // },
    });
    popKeys.push({
      path: "ServiceId",
      select: "lookup_value",
    });
    popKeys.push({
      path: "ServiceModeId",
      select: "lookup_value",
    });
    popKeys.push({
      path: "ServiceCategoryId",
      select: "lookup_value",
    });
    popKeys.push({
      path: "ServiceSubCategoryId",
      select: "lookup_value",
    });
    popKeys.push({
      path: "TherapyId",
      select: "lookup_value",
    });

    const list = await tlbContractMapping
      .find(
        { ContractId: mongoose.Types.ObjectId(contract_id) },
        "RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD DeliveryCharges IsActive ServiceCategoryId ServiceSubCategoryId IsDiscountAvailable IsPackageAvailable"
      )
      .populate(popKeys);
    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          ...item,
        }))
      )
    );
  } catch (error) {
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

// (it will map data only by service like if  medical consultation then it will show all medical consultation rate contract
router.post("/ContractRateMapListByService", async (req, res) => {
  try {
    APIEndPointNo = "#KCC0007";
    const { service_id } = req.body;
    const popKeys = new Array();
    popKeys.push({
      // path: "ContractId",
      // select: "ContractCode ContractDesc StartDate EndDate AssetId IsExpired",
      path: "ContractId",
      select: "ContractCode ContractDesc StartDate EndDate AssetId IsExpired",
      populate: {
        path: "AssetId",
        select: "AssetName",
      },
    });
    popKeys.push({
      path: "ServiceId",
      select: "lookup_value",
    });
    popKeys.push({
      path: "ServiceModeId",
      select: "lookup_value",
    });
    popKeys.push({
      path: "TherapyId",
      select: "lookup_value",
    });

    // Use `let` instead of `const` so you can reassign it later

    let list = await tlbContractMapping
      .find(
        { ServiceId: mongoose.Types.ObjectId(service_id), IsActive: true },
        "RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD IsActive ServiceCategoryId ServiceSubCategoryId IsDiscountAvailable"
      )
      .populate(popKeys);
    if (!list || list.length == 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }

    //Filter the expired options
    list = list.filter(function (obj) {
      return !obj.IsExpired;
    });

    return res.json(
      __requestResponse(
        "200",
        __SUCCESS,
        __deepClone(list).map((item) => ({
          ...item,
        }))
      )
    );
  } catch (error) {
    console.log(error, "error");
    return res.json(
      __requestResponse(
        "400",
        __SOME_ERROR,
        "Error Code: " + APIEndPointNo + "_0.1:" + error
      )
    );
  }
});

// list service by only their asset id
router.post("/ContractRateMapListByAssetx", async (req, res) => {
  let APIEndPointNo = "#KCC0008"; // New endpoint code
  try {
    const { asset_id } = req.body;

    // Validate AssetId
    if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
      return res.status(400).json(__requestResponse("400", "Invalid AssetId"));
    }

    // Populate keys with nested population for AssetId
    const popKeys = [
      {
        path: "ContractId",
        match: { AssetId: mongoose.Types.ObjectId(asset_id) }, // Filter by AssetId
        select: "ContractCode ContractDesc StartDate EndDate AssetId IsExpired",
        populate: {
          path: "AssetId",
          select: "AssetName",
        },
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
    ];

    // Fetch the contract mappings associated with the provided AssetId
    let list = await tlbContractMapping
      .find(
        { IsActive: true },
        "RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD IsActive ServiceCategoryId ServiceSubCategoryId IsDiscountAvailable"
      )
      .populate(popKeys);

    // Filter out contracts where ContractId is null or does not match AssetId
    list = list.filter(
      (item) => item.ContractId?.AssetId?._id.toString() === asset_id
    );

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }

    // Map the response to include the ContractName and AssetName
    const mappedList = list.map((item) => ({
      ...item.toObject(),
      ContractDesc: item.ContractId?.ContractDesc || "N/A",
      AssetName: item.ContractId?.AssetId?.AssetName || "N/A",
    }));

    return res.json(__requestResponse("200", __SUCCESS, mappedList));
  } catch (error) {
    console.error(error, "error");
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

// list service by only their asset id
router.post("/ContractRateMapListByAsset", async (req, res) => {
  let APIEndPointNo = "#KCC0008";
  try {
    const { asset_id } = req.body;

    // Validate AssetId
    if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
      return res.status(400).json(__requestResponse("400", "Invalid AssetId"));
    }

    // Populate keys with nested population
    const popKeys = [
      {
        path: "ContractId",
        match: { AssetId: mongoose.Types.ObjectId(asset_id) },
        select: "ContractCode ContractDesc StartDate EndDate AssetId IsExpired",
        populate: {
          path: "AssetId",
          select: "AssetName",
        },
      },
      { path: "ServiceId", select: "lookup_value" },
      { path: "ServiceModeId", select: "lookup_value" },
      { path: "TherapyId", select: "lookup_value" },
      { path: "ServiceCategoryId", select: "lookup_value" },
      { path: "ServiceSubCategoryId", select: "lookup_value" },
    ];

    // Fetch the contract mappings associated with the provided AssetId
    let list = await tlbContractMapping
      .find(
        { IsActive: true },
        "RateINR RateUSD MRPINR MRPUSD OfferINR OfferUSD IsActive"
      )
      .populate(popKeys);

    // Filter out contracts where ContractId is null or does not match AssetId
    list = list.filter(
      (item) => item.ContractId?.AssetId?._id.toString() === asset_id
    );

    if (!list || list.length === 0) {
      return res.json(__requestResponse("404", __DATA_404));
    }
    // console.log(list, "list - admin contract line 1076");

    // Map the response to include the RateContract string
    const mappedList = list.map((item) => {
      const service = item.ServiceId?.lookup_value || "N/A";
      const serviceMode = item.ServiceModeId?.lookup_value || "N/A";
      const therapy = item.TherapyId?.lookup_value || "N/A";
      const serviceCategory = item.ServiceCategoryId?.lookup_value || "N/A";
      const serviceSubCategory =
        item.ServiceSubCategoryId?.lookup_value || "N/A";
      const RateINR = item.RateINR || "N/A";
      const RateUSD = item.RateUSD || "N/A";
      const MRPINR = item.MRPINR || "N/A";
      const MRPUSD = item.MRPUSD || "N/A";
      const OfferINR = item.OfferINR || "N/A";
      const OfferUSD = item.OfferUSD || "N/A";
      // Construct the RateContract string
      const rateContract = `| Service - ${service} | ServiceMode - ${serviceMode} | Therapy - ${therapy} | ServiceCategory - ${serviceCategory} 
      | ServiceSubCategory - ${serviceSubCategory} | Charges - Rate INR - ${RateINR}, Rate USD - ${RateUSD}, MRP INR - ${MRPINR}, MRP USD - ${MRPUSD}, Offer INR - ${OfferINR}, Offer USD - ${OfferUSD}`;

      return {
        ...item.toObject(),
        ContractName: item.ContractId?.ContractDesc || "N/A",
        AssetName: item.ContractId?.AssetId?.AssetName || "N/A",
        RateContract: rateContract,
      };
    });

    return res.json(__requestResponse("200", __SUCCESS, mappedList));
  } catch (error) {
    console.error(error, "error");
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
