const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { __requestResponse, __deepClone } = require("../../../utils/constent");

const {
    __SUCCESS,
    __SOME_ERROR,
    __RECORD_NOT_FOUND,
} = require("../../../utils/variable");

const { __CreateAuditLog } = require("../../../utils/auditlog");
const Inventory = require("../../../models/NewInventoryMaster");

// ✅ Add / Edit Inventory
router.post("/SaveInventory", async (req, res) => {
    try {
        const {
            _id,
            ProductSupplierMappingId,
            AvailableStock,
            IsActive = true,
        } = req.body;

        const saveData = {
            ProductSupplierMappingId: mongoose.Types.ObjectId(
                ProductSupplierMappingId
            ),
            AvailableStock,
            IsActive,
        };

        if (!_id) {
            const check = await Inventory.findOne({
                ProductSupplierMappingId: mongoose.Types.ObjectId(
                    ProductSupplierMappingId
                ),
            });
            if (check) {
                return res.json(
                    __requestResponse("400", "Inventory Data Already Exist")
                );
            }
            // ➕ Add new
            const newRec = await Inventory.create(saveData);

            await __CreateAuditLog(
                "n_inventory_master",
                "Inventory.Add",
                null,
                null,
                saveData,
                newRec._id
            );

            return res.json(__requestResponse("200", __SUCCESS, newRec));
        } else {
            // ✏️ Edit
            const oldRec = await Inventory.findById(_id);
            if (!oldRec)
                return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

            await Inventory.updateOne({ _id }, { $set: saveData });

            await __CreateAuditLog(
                "n_inventory_master",
                "Inventory.Edit",
                null,
                oldRec,
                saveData,
                _id
            );

            return res.json(__requestResponse("200", __SUCCESS, saveData));
        }
    } catch (error) {
        console.error("❌ Error in SaveInventory:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// ✅ List Inventory with details
router.post("/GetInventory", async (req, res) => {
    try {
        const { ProductSupplierMappingId } = req.body;

        const data = await Inventory.findOne({
            ProductSupplierMappingId: mongoose.Types.ObjectId(
                ProductSupplierMappingId
            ),
        });
        if (!data) {
            return res.json(
                __requestResponse("400", "Inventory Data Not Found")
            );
        }
        return res.json(__requestResponse("200", __SUCCESS, data));
    } catch (error) {
        console.error("❌ Error in listInventory:", error);
        return res.json(__requestResponse("500", __SOME_ERROR, error));
    }
});

// // ✅ Delete inventory record
// router.post("/deleteInventory", async (req, res) => {
//     try {
//         const { InventoryId } = req.body;

//         const record = await Inventory.findById(InventoryId);
//         if (!record)
//             return res.json(__requestResponse("400", __RECORD_NOT_FOUND));

//         await Inventory.deleteOne({ _id: InventoryId });

//         await __CreateAuditLog(
//             "n_inventory_master",
//             "Inventory.Delete",
//             null,
//             record,
//             null,
//             InventoryId
//         );

//         return res.json(__requestResponse("200", __SUCCESS, {}));
//     } catch (error) {
//         console.error("❌ Error in deleteInventory:", error);
//         return res.json(__requestResponse("500", __SOME_ERROR, error));
//     }
// });

module.exports = router;
