const { default: mongoose } = require("mongoose");
const Joi = require("joi");
const { __requestResponse } = require("../../../utils/constent");
const {
  __VALIDATION_ERROR,
  __SOME_ERROR,
  __DUPLICATE_ADDRESS,
  __ADDRESS_LABEL_MISSING,
} = require("../../../utils/variable");

const _contractValidation = Joi.object({
  contract_id: Joi.string().allow(null, ""),
  contract_desc: Joi.string().required(),
  asset_id: Joi.string().required(),
  start_date: Joi.string().required(),
  end_date: Joi.string().required(),
  is_current: Joi.bool().required(),
  contract_type_id: Joi.string().required(),
  document: Joi.string().allow(null, ""),
});
const checkContractInput = async (req, res, next) => {
  const { error, value } = _contractValidation.validate(req.body);
  if (error) {
    return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
  }
    const { contract_id, document } = req.body;

    if (!contract_id) {
      if (!document) {
        return res.json(
          __requestResponse(
            "400",
            "To create a new contract, you must upload contract document also."
          )
        );
      }
    }
  next();
};

const _ContractRateValidation = Joi.object({
  contract_service_id: Joi.string().allow(null, ""),
  contract_id: Joi.string().required(),
  service_id: Joi.string().required(),
  service_mode_id: Joi.string().required(),
  service_category_id: Joi.string().allow(null, ""),
  service_sub_category_id: Joi.string().allow(null, ""),
  therapy_id: Joi.string().allow(null, ""), //only for hospital and doctor
  rate_inr: Joi.number().required(),
  rate_usd: Joi.number().required(),
  mrp_inr: Joi.number().required(),
  mrp_usd: Joi.number().required(),
  offer_inr: Joi.number().required(),
  offer_usd: Joi.number().required(),
  delivery_charges: Joi.number().optional(),
  is_active: Joi.bool().required(),
  is_discount_available: Joi.bool().required(),
  is_package_available: Joi.bool().allow(null),
});
const checkContractRateMap = async (req, res, next) => {
  const { rate_contracts } = req.body;
  if (Array.isArray(rate_contracts)) {
    rate_contracts.map(async (x) => {
      const {
        contract_service_id,
        contract_id,
        service_id,
        service_mode_id,
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

      //Check the data hygiene
      const { error, value } = _ContractRateValidation.validate(x);
      if (error) {
        return res.json(__requestResponse("400", __VALIDATION_ERROR, error));
      }
      if (rate_inr > mrp_inr) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Rate(INR). Rate can not be greater than MRP(INR) Rate."
          )
        );
      }
      if (rate_usd > mrp_usd) {
        return res.json(
          __requestResponse(
            "400",
            "Invalid Rate(USD). Rate can not be greater than MRP(USD) Rate."
          )
        );
      }
    });
  }
  next();
};
module.exports = { checkContractInput, checkContractRateMap };
