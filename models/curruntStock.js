import mongoose from "mongoose";
import { sendError, sendResult } from "../constant/HttpResponse.js";
import { dataFormat } from "../utils/dataManupulation.js";
import ItemsModel from "./Items.js";
import SizesModel from "./Sizes.js";
// Defining Schema
const curruntStocksSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "items" },
  sizes: [
    {
      size: { type: mongoose.Schema.Types.ObjectId, ref: "sizes" },
      qty: Number,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const CurruntStocks = mongoose.model("curruntstocks", curruntStocksSchema);
// save
export const saveCurruntStocks = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new CurruntStocks(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};

export class CurruntStockController {
  static getCurruntStock = async (req, res) => {
    try {
      await CurruntStocks.find({})
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
            resposeObj = await dataFormat({stocks});
          } else {
            resposeObj = { items: [], grantTotal: 0 };
          }
          sendResult(res, resposeObj, "Data Retrieved");
        }).catch((error) => {
          console.log(error);
          sendError(res, error, "Something Went Wrong");
        });
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };
}

export const addStockItemWithSizes = async (itemID, sizeID, qty) => {
  try {
    const existingItemInCurruntStock = await CurruntStocks.findOne({
      item: itemID,
    });

    if (!existingItemInCurruntStock) {
      saveCurruntStocks({
        item: itemID,
        sizes: [
          {
            size: sizeID,
            qty: qty,
          },
        ],
      });
    } else {
      const existingSizeInCurruntStockItem = await CurruntStocks.findOne({
        item: itemID,
        "sizes.size": sizeID,
      });

      if (!existingSizeInCurruntStockItem) {
        await CurruntStocks.findOneAndUpdate(
          { item: itemID },
          { $addToSet: { sizes: { size: sizeID, qty: qty } } },
          { upsert: true }
        );
      } else {
        await CurruntStocks.findOneAndUpdate(
          { item: itemID, "sizes.size": sizeID },
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
export const removeStockItemWithSizes = async (itemID, sizeID, qty) => {
  try {
    const existingItemInCurruntStock = await CurruntStocks.findOne({
      item: itemID,
    });

    if (!existingItemInCurruntStock) {
      saveCurruntStocks({
        item: itemID,
        sizes: [
          {
            size: sizeID,
            qty: -qty,
          },
        ],
      });
    } else {
      const existingSizeInCurruntStockItem = await CurruntStocks.findOne({
        item: itemID,
        "sizes.size": sizeID,
      });

      if (!existingSizeInCurruntStockItem) {
        await CurruntStocks.findOneAndUpdate(
          { item: itemID },
          { $addToSet: { sizes: { size: sizeID, qty: -qty } } },
          { upsert: true }
        );
      } else {
        await CurruntStocks.findOneAndUpdate(
          { item: itemID, "sizes.size": sizeID },
          { $inc: { "sizes.$.qty": -qty } },
          { upsert: true }
        );
      }
    }

    // Update the inventory with the new size and quantity
  } catch (error) {
    console.error("Error adding item with sizes:", error);
  }
};

export default CurruntStocks;
