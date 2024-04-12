import mongoose from "mongoose";
const Schema = mongoose.Schema
import { sendError, sendResult } from "../constant/HttpResponse.js";

// Defining Schema
const subDistributorsSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  distributorID: { type: Schema.Types.ObjectId, ref: "distributors", required: true }, // Foreign key referencing Item collection
  createdAt: {
    type: Date,
    default: Date.now,
    }
});

// Model
const SubDistributorsModel = mongoose.model("subdistributors", subDistributorsSchema);
// save
export const saveSubDistributorsModel = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new SubDistributorsModel(data);
      const saved_document = await doc.save();
      resolve(saved_document);
    } catch (error) {
      reject(error);
    }
  });
};


export class SubDistributorsController {
  //  save SubDistributor
  static saveSubDistributor = async (req, res) => {
    console.log("save SubDistributor called");
    try {
      const { name, distributorID } = req.body;
      if (name &&
        distributorID) {
        saveSubDistributorsModel({
          name,
          distributorID,
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
          "name, distributorID, are required parameters",
          "Something Went Wrong"
        );
      }
    } catch (error) {
      console.log(error);
      sendError(res, error, "Something Went Wrong");
    }
  };

  static getAllSubDistributors = async (req, res) => {
    console.log("get all Size called");
    try {
      getAllSubDistributorsModel()
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



export const getAllSubDistributorsModel = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const docs = SubDistributorsModel.find();
      resolve(docs);
    } catch (error) {
      reject(error);
    }
  });
};

export default SubDistributorsModel;
