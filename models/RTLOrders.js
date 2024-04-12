import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { sendError, sendResult } from "../constant/HttpResponse.js";
import ItemsModel from "./Items.js";
import SizesModel from "./Sizes.js";
import { removeStockItemWithSizes } from "./curruntStock.js";
import { dataFormat } from "../utils/dataManupulation.js";

// Defining Schema
const rtlordersSchema = new mongoose.Schema({
  chalanNumber: { type: String, required: true, trim: true },
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
const RtlOrdersModel = mongoose.model("rtlorders", rtlordersSchema);
// save
export const saveRtlOrdersModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new RtlOrdersModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};

export class RtlOrdersController {
  //  save RtlOrder
  static saveRtlOrder = async (req, res) => {
    console.log("save RtlOrder called");
    try {
      const { itemID, sizeID, qty, date, chalanNumber } = req.body;
      if (itemID && sizeID && qty && date && chalanNumber) {
        SaveRTLOrdersModelItem({
          chalanNumber,
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
            console.log(error);
            sendError(res, error, "Something Went Wrong");
          });
      } else {
        sendError(
          res,
          "itemID , sizeID , qty , date , chalanNumber are required parameter",
          "Something Went Wrong"
        );
      }
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };

  static getRTLOrderByChalanNumber = async (req, res) => {
    try {
      const { chalanNumber } = req.query;

      await RtlOrdersModel.find({ chalanNumber })
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

  static getRtlOrderByDistributorDateItem = async (req, res) => {
    try {
      const { fromDate, toDate, itemID, chalanNumber } = req.query;

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

      let stocks = await RtlOrdersModel.find(searchTerms)
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


export const SaveRTLOrdersModelItem = async ({
  chalanNumber,
  itemID,
  sizeID,
  qty,
  date,
}) => {
  try {
    const existingItemInCurruntStock = await RtlOrdersModel.findOne({
      item: itemID,
    });

    if (!existingItemInCurruntStock) {
      saveRtlOrdersModel({
        date,
        chalanNumber,
        item: itemID,
        sizes: [
          {
            size: sizeID,
            qty: qty,
          },
        ],
      });
    } else {
      const existingSizeInCurruntStockItem = await RtlOrdersModel.findOne({
        item: itemID,
        "sizes.size": sizeID,
      });

      if (!existingSizeInCurruntStockItem) {
        await RtlOrdersModel.findOneAndUpdate(
          { item: itemID },
          { $addToSet: { sizes: { size: sizeID, qty: qty } } },
          { upsert: true }
        );
      } else {
        await RtlOrdersModel.findOneAndUpdate(
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
export default RtlOrdersModel;
