class ApiResponse{
    constructor(statusCode,data,message="Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}


export default ApiResponse;

// class to return api response: customized version of built in api response