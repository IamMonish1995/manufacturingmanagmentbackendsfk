import SizesModel from "../models/Sizes.js";

export const dataFormat = async ({stocks}) =>{
    const getAllSizes = async () => {
        const allSizes = await SizesModel.find({}, "name");
        return allSizes.map((size) => size.name);
      };
      const allSizes = await getAllSizes();
      const updatedStocks = [];
      stocks.map((stock) => {
        const existingSizes = stock.sizes.map((sizeObj) => sizeObj.size.name);
        allSizes.forEach((size) => {
          if (!existingSizes.includes(size)) {
            stock.sizes.push({ size: { name: size }, qty: 0 });
          }
        });
        stock.sizes.sort((a, b) => a.size.name.localeCompare(b.size.name));
        const totalqty = stock.sizes.reduce(
          (total, size) => total + size.qty,
          0
        );
        let tempObj = {
          _id: stock._id,
          chalanNumber:stock.chalanNumber,
          distributor:stock?.distributorID?.name,
          subDistributor:stock?.subDistributorID?.name,
          item: stock.item,
          sizes: stock.sizes,
          totalqty: totalqty,
          date:stock.date
        };
        updatedStocks.push(tempObj);
      });

      
      const grantTotal = updatedStocks.reduce(
        (total, stock) => total + stock.totalqty,
        0
      );
      const resposeObj = {
        items:updatedStocks,
        grantTotal :grantTotal
      };

      return resposeObj
}