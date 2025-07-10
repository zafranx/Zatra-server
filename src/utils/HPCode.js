const mongoose = require("mongoose");
const tlbHPProfile = require("../models/AssetHealthProfile");

async function __HPCode() {
  let _HPC = "";
  const _HProfile = await tlbHPProfile.count();
  if (_HProfile) {
    _HPC = "HP" + (_HProfile + 1).toString().padStart(5, "0");
  }
  return _HPC;
}

module.exports = { __HPCode };
