//utility class to standardize the shape of the API responses
class ApiResponse {
    constructor(statusCode , data , message = "success"){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}

/*
Instead of writing this JSON manually every time
{
  statusCode: 200,
  data: "OK",
  message: "Health check passed",
  success: true
}

Just use:
new ApiResponse(200, "OK", "Health check passed")

*/