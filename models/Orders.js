import mongoose from "mongoose";
import { sendError, sendResult } from "../constant/HttpResponse.js";
import DistributorsModel from "./Distributors.js";
import ItemsModel from "./Items.js";
import SizesModel from "./Sizes.js";
import SubDistributorsModel from "./SubDistributors.js";
import { removeStockItemWithSizes } from "./curruntStock.js";
import { dataFormat } from "../utils/dataManupulation.js";

const Schema = mongoose.Schema;

// Defining Schema
const ordersSchema = new mongoose.Schema({
  chalanNumber: { type: String, required: true, trim: true },
  distributorID: {
    type: Schema.Types.ObjectId,
    ref: "distributors",
    required: true,
  }, // Foreign key referencing Item collection
  subDistributorID: {
    type: Schema.Types.ObjectId,
    ref: "subdistributors",
    required: true,
  }, // Foreign key referencing Item collection
  item: { type: mongoose.Schema.Types.ObjectId, ref: "items" },
  sizes: [
    {
      size: { type: mongoose.Schema.Types.ObjectId, ref: "sizes" },
      qty: Number,
    },
  ],
  date: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const OrdersModel = mongoose.model("orders", ordersSchema);
// save
export const saveOrdersModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new OrdersModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};

export class OrdersController {
  //  save Order
  static saveOrder = async (req, res) => {
    console.log("save Order called");
    try {
      const {
        distributorID,
        itemID,
        sizeID,
        qty,
        date,
        chalanNumber,
        subDistributorID,
      } = req.body;
      if (
        distributorID &&
        itemID &&
        sizeID &&
        qty &&
        date &&
        chalanNumber &&
        subDistributorID
      ) {
        SaveOrdersModelItem({
          chalanNumber,
          distributorID,
          subDistributorID,
          itemID,
          sizeID,
          qty,
          date,
        })
          .then((result) => {
            removeStockItemWithSizes(itemID, sizeID, qty);
            sendResult(res, result, "Data Saved");
          })
          .catch((error) => {
            sendError(res, error, "Something Went Wrong");
          });
      } else {
        sendError(
          res,
          "distributorID , itemID , sizeID , qty , date ,chalanNumber are required parameters",
          "Something Went Wrong"
        );
      }
    } catch (error) {
      sendError(res, error, "Something Went Wrong");
    }
  };

  static getOrderByChalanNumber = async (req, res) => {
    try {
      const { chalanNumber, distributorID, subDistributorID } = req.query;
      let searchTerms = {};
      if (chalanNumber) {
        searchTerms = { ...searchTerms, chalanNumber };
      }
      if (distributorID) {
        searchTerms = { ...searchTerms, distributorID };
      }
      if (subDistributorID) {
        searchTerms = { ...searchTerms, subDistributorID };
      }
      await OrdersModel.find(searchTerms)
        .populate({
          path: "distributorID",
          model: DistributorsModel,
          select: "name ",
        })
        .populate({
          path: "subDistributorID",
          model: SubDistributorsModel,
          select: "name ",
        })
        .populate({
          path: "item",
          model: ItemsModel,
          select: "itemcode name ",
        })
        .populate({
          path: "sizes.size",
          model: SizesModel,
          select: "name ",
        })
        .then(async (stocks) => {
          let resposeObj;
          if (stocks && stocks.length > 0) {
            resposeObj = await dataFormat({ stocks });
          } else {
            resposeObj = { items: [], grantTotal: 0 };
          }
          sendResult(res, resposeObj, "Data Retrieved");
        })
        .catch((error) => {
          console.log(error);
          sendError(res, error, "Something Went Wrong1");
        });
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong2");
    }
  };
  static getOrderByDistributorDateItem = async (req, res) => {
    try {
      const {
        distributorID,
        subDistributorID,
        fromDate,
        toDate,
        itemID,
        chalanNumber,
      } = req.query;

      let searchTerms = {
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      };
      if (chalanNumber) {
        searchTerms = { ...searchTerms, chalanNumber };
      }
      if (itemID) {
        searchTerms = { ...searchTerms, item:itemID };
      }
      if (distributorID) {
        searchTerms = { ...searchTerms, distributorID };
      }
      if (subDistributorID) {
        searchTerms = { ...searchTerms, subDistributorID };
      }

      let stocks = await OrdersModel.find(searchTerms)
        .populate({
          path: "distributorID",
          model: DistributorsModel,
          select: "name ",
        })
        .populate({
          path: "subDistributorID",
          model: SubDistributorsModel,
          select: "name ",
        })
        .populate({
          path: "item",
          model: ItemsModel,
          select: "itemcode name",
        })
        .populate({
          path: "sizes.size",
          model: SizesModel,
          select: "name",
        });

      let resposeObj;
      if (stocks && stocks.length > 0) {
        resposeObj = await dataFormat({ stocks });
      } else {
        resposeObj = { items: [], grantTotal: 0 };
      }
      sendResult(res, resposeObj, "Data Retrieved");
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong2");
    }
  };
}


export const SaveOrdersModelItem = async ({
  chalanNumber,
  subDistributorID,
  distributorID,
  itemID,
  sizeID,
  qty,
  date,
}) => {
  try {
    const existingItemInCurruntStock = await OrdersModel.findOne({
      item: itemID,subDistributorID,chalanNumber,distributorID
    });

    if (!existingItemInCurruntStock) {
      saveOrdersModel({
        date,
        chalanNumber,
        distributorID,
        subDistributorID,
        item: itemID,
        sizes: [
          {
            size: sizeID,
            qty: qty,
          },
        ],
      });
    } else {
      const existingSizeInCurruntStockItem = await OrdersModel.findOne({
        item: itemID,subDistributorID,chalanNumber,distributorID,
        "sizes.size": sizeID,
      });

      if (!existingSizeInCurruntStockItem) {
        await OrdersModel.findOneAndUpdate(
          { item: itemID,subDistributorID,chalanNumber,distributorID },
          { $addToSet: { sizes: { size: sizeID, qty: qty } } },
          { upsert: true }
        );
      } else {
        await OrdersModel.findOneAndUpdate(
          { item: itemID,subDistributorID,chalanNumber,distributorID,"sizes.size": sizeID },
          { $inc: { "sizes.$.qty": qty } },
          { upsert: true }
        );
      }
    }

    // Update the inventory with the new size and quantity
  } catch (error) {
    console.error("Error adding item with sizes:", error);
  }
};
export default OrdersModel;
