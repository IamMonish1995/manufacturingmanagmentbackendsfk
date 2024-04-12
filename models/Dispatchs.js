import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { sendError, sendResult } from "../constant/HttpResponse.js";

import DistributorsModel from "./Distributors.js";
import ItemsModel from "./Items.js";
import SizesModel from "./Sizes.js";
import SubDistributorsModel from "./SubDistributors.js";
import { dataFormat } from "../utils/dataManupulation.js";

// Defining Schema
const dispachsSchema = new Schema({
  chalanNumber: { type: String, required: true, trim: true },
  distributorID: {
    type: Schema.Types.ObjectId,
    ref: "distributors",
    required: true,
  },
  subDistributorID: {
    type: Schema.Types.ObjectId,
    ref: "subdistributors",
    required: true,
  },
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
const DispatchModel = mongoose.model("dispatchs", dispachsSchema);

// save
export const saveDispatchModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new DispatchModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};
export class DispatchController {
  //  save dispatch
  static saveDispatch = async (req, res) => {
    console.log("save dispatch called");
    try {
      const {
        subDistributorID,
        itemID,
        sizeID,
        qty,
        date,
        chalanNumber,
        distributorID,
      } = req.body;
      if (
        subDistributorID &&
        distributorID &&
        itemID &&
        sizeID &&
        qty &&
        date &&
        chalanNumber
      ) {
        SaveDispatchModelItem({
          chalanNumber,
          distributorID,
          subDistributorID,
          itemID,
          sizeID,
          qty,
          date,
        })
          .then((result) => {
            sendResult(res, result, "Data Saved");
          })
          .catch((error) => {
            console.log(error);
            sendError(res, error, "Something Went Wrong");
          });
      } else {
        sendError(
          res,
          "subDistributorID,distributorID, itemID, sizeID, qty, date , chalanNumber are required parameters",
          "Something Went Wrong"
        );
      }
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };

  static getDispatchByChalanNumber = async (req, res) => {
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
      await DispatchModel.find(searchTerms)
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
}

export const SaveDispatchModelItem = async ({
  chalanNumber,
  itemID,
  sizeID,
  qty,
  date,
  subDistributorID,
  distributorID,
}) => {
  try {
    const existingItemInCurruntStock = await DispatchModel.findOne({
      item: itemID,
      chalanNumber,
      distributorID,
      subDistributorID,
    });

    if (!existingItemInCurruntStock) {
      saveDispatchModel({
        subDistributorID,
        distributorID,
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
      const existingSizeInCurruntStockItem = await DispatchModel.findOne({
        item: itemID,
        chalanNumber,
        distributorID,
        subDistributorID,
        "sizes.size": sizeID,
      });

      if (!existingSizeInCurruntStockItem) {
        await DispatchModel.findOneAndUpdate(
          { item: itemID, chalanNumber, distributorID, subDistributorID },
          { $addToSet: { sizes: { size: sizeID, qty: qty } } },
          { upsert: true }
        );
      } else {
        await DispatchModel.findOneAndUpdate(
          {
            item: itemID,
            chalanNumber,
            distributorID,
            subDistributorID,
            "sizes.size": sizeID,
          },
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

export default DispatchModel;
