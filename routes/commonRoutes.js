import express from "express";

import { CurruntStockController } from "../models/curruntStock.js";
import { DispatchController } from "../models/Dispatchs.js";
import { DistributorsController } from "../models/Distributors.js";
import { InventoryController } from "../models/Inventory.js";
import { ItemsController } from "../models/Items.js";
import { OrdersController } from "../models/Orders.js";
import { SizesController } from "../models/Sizes.js";
import { SubDistributorsController } from "../models/SubDistributors.js";
import { RtlOrdersController } from "../models/RTLOrders.js";

const router = express.Router();
router.post("/savesize",SizesController.saveSize);
router.get("/getallsizes",SizesController.getAllSizes);
router.post("/saveitem",ItemsController.saveItem);
router.get("/getallitems",ItemsController.getAllItems);
router.post("/savedistributor",DistributorsController.saveDistributor);
router.get("/getalldistributors",DistributorsController.getAllDistributors);
router.post("/savesubdistributor",SubDistributorsController.saveSubDistributor);
router.get("/getallsubdistributors",SubDistributorsController.getAllSubDistributors);
router.post("/saveinventory",InventoryController.saveInventory);
router.get("/getcurruntstock",CurruntStockController.getCurruntStock);
router.post("/saveorder",OrdersController.saveOrder);
router.get("/getorderbychalannumber",OrdersController.getOrderByChalanNumber);
router.get("/getOrderByDistributorDateItem",OrdersController.getOrderByDistributorDateItem);
router.post("/savertlorder",RtlOrdersController.saveRtlOrder);
router.get("/getrtlorderbychalannumber",RtlOrdersController.getRTLOrderByChalanNumber);
router.get("/getRtlOrderByDistributorDateItem",RtlOrdersController.getRtlOrderByDistributorDateItem);
router.post("/savedispatch",DispatchController.saveDispatch);
router.get("/getdispatchbychalannumber",DispatchController.getDispatchByChalanNumber);

export default router;
