export const httpStatus = {
  success: 200,
  created: 201,
  nocontent: 204,
  bad: 400,
  unauthorized: 401,
  notfound: 404,
  conflict: 409,
  error: 500,
};

export const sendResult = (res, result ,message ) => {
  res.status(200).json({
    status: "success",
    message: message,
    result: result,
  });
};
export const sendError = (res, error ,message ) => {
  res.status(500).json({
    status: "failed",
    message: message,
    error: error,
  });
};


