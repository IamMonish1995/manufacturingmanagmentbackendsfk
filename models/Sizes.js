import mongoose from "mongoose";
import { sendError, sendResult } from "../constant/HttpResponse.js";
// Defining Schema
const sizesSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  createdAt: {
    type: Date,
    default: Date.now,
    }
});

// Model
const SizesModel = mongoose.model("sizes", sizesSchema);
// save
export const saveSizesModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new SizesModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};


export class SizesController {
  //  save ITEM
  static saveSize = async (req, res) => {
    console.log("save Size called");
    try {
      const { name } = req.body;
      if (name) {
        saveSizesModel({
          name,
        })
          .then((result) => {
            sendResult(res, result, "Data Saved");
          })
          .catch((error) => {
            sendError(res, error, "Something Went Wrong");
          });
      } else {
        sendError(res, "name is required parameter", "Something Went Wrong");
      }
    } catch (error) {
      sendError(res, error, "Something Went Wrong");
    }
  };
  static getAllSizes = async (req, res) => {
    console.log("get all Size called");
    try {
      getAllSizesModel()
        .then((result) => {
          sendResult(res, result, "Data retrived");
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


export const getAllSizesModel = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const docs = SizesModel.find();
      resolve(docs);
    } catch (error) {
      reject(error);
    }
  });
};
export default SizesModel;
