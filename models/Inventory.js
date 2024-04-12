import mongoose from "mongoose";
import { sendError, sendResult } from "../constant/HttpResponse.js";
import { addStockItemWithSizes } from "./curruntStock.js";
const Schema = mongoose.Schema;
// Defining Schema
const inventerySchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: "items" },
  sizes: [
    {
      size: { type: mongoose.Schema.Types.ObjectId, ref: "sizes" },
      qty: Number,
    },
  ],
  date: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const InventoryModel = mongoose.model("inventories", inventerySchema);
// save
export const saveInventoryModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new InventoryModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};


export class InventoryController {
  //  save inventory
  static saveInventory = async (req, res) => {
    console.log("save Inventory called");
    try {
      const { itemID, sizeID, qty, date } = req.body;
      if (itemID && sizeID && qty && date) {
        SaveInventoryModelItem({
          itemID,
          sizeID,
          qty,
          date,
        })
          .then((result) => {
            addStockItemWithSizes(itemID, sizeID, qty);
            sendResult(res, result, "Data Saved");
          })
          .catch((error) => {
            sendError(res, error, "Something Went Wrong");
          });
      } else {
        sendError(
          res,
          "itemID, sizeID, qty, date are required parameters",
          "Something Went Wrong"
        );
      }
    } catch (error) {
      sendError(res, error, "Something Went Wrong");
    }
  };
}


export const SaveInventoryModelItem = async ({itemID, sizeID, qty, date}) => {
  try {
    const existingItemInCurruntStock = await InventoryModel.findOne({
      item: itemID,date
    });

    if (!existingItemInCurruntStock) {
      saveInventoryModel({
        item: itemID,
        sizes: [
          {
            size: sizeID,
            qty: qty,
          },
        ],
        date
      });
    } else {
      const existingSizeInCurruntStockItem = await InventoryModel.findOne({
        item: itemID,date,
        "sizes.size": sizeID,
      });

      if (!existingSizeInCurruntStockItem) {
        await InventoryModel.findOneAndUpdate(
          { item: itemID,date },
          { $addToSet: { sizes: { size: sizeID, qty: qty } } },
          { upsert: true }
        );
      } else {
        await InventoryModel.findOneAndUpdate(
          { item: itemID,date, "sizes.size": sizeID },
          { $inc: { "sizes.$.qty": qty } },
          { upsert: true }
        );
      }
    }

    // Update the inventory with the new size and quantity
  } catch (error) {
    console.log(error);
    console.error("Error adding item with sizes:", error);
  }
};


export default InventoryModel;
