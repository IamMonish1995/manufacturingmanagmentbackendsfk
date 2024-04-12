import mongoose from "mongoose";
import { sendError, sendResult } from "../constant/HttpResponse.js";

// Defining Schema
const distributorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  createdAt: {
    type: Date,
    default: Date.now,
    }
});

// Model
const DistributorsModel = mongoose.model("distributors", distributorSchema);
// save
export const saveDistributorsModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new DistributorsModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

export class DistributorsController {
  //  save Distributor
  static saveDistributor = async (req, res) => {
    console.log("save Distributor called");
    try {
      const { name } = req.body;
      if (name) {
        saveDistributorsModel({
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
        sendError(res, "name is required parameter", "Something Went Wrong");
      }
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };
  static getAllDistributors = async (req, res) => {
    console.log("get all Size called");
    try {
      getAllDistributorsModel()
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
  }
}



export const getAllDistributorsModel = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const docs = DistributorsModel.find();
      resolve(docs);
    } catch (error) {
      reject(error);
    }
  });
};
export default DistributorsModel;
