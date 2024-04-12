import mongoose from "mongoose";
import { sendError, sendResult } from "../constant/HttpResponse.js";
// Defining Schema
const itemsSchema = new mongoose.Schema({
  itemcode: { type: String, required: true,unique : true, trim: true },
  name: { type: String, required: false, trim: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Model
const ItemsModel = mongoose.model("items", itemsSchema);

export const saveItemModal = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new ItemsModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};


export class ItemsController {
  //  save ITEM
  static saveItem = async (req, res) => {
    console.log("save item called");
    try {
      const { itemcode, name } = req.body;
      if (itemcode) {
        saveItemModal({
          itemcode,
          name,
        })
          .then((result) => {
            sendResult(res, result, "Data Saved");
          })
          .catch((error) => {
            console.log(error);
            sendError(res, error, "Something Went Wrong");
          });

      } else {
        sendError(res, "itemcode is required parameter", "Something Went Wrong");
      }
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };
  static getAllItems = async (req, res) => {
    console.log("get all called");
    try {
        getAllItemsModel()
          .then((result) => {
            sendResult(res, result, "Data Retrived");
          })
          .catch((error) => {
            console.log(error);
            sendError(res, error, "Something Went Wrong");
          });

     
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };
}


export const getAllItemsModel = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const docs = ItemsModel.find();
      resolve(docs);
    } catch (error) {
      reject(error);
    }
  });
};
export default ItemsModel;
