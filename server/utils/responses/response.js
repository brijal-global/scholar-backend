export class SuccessResponse {
  constructor() {
    this.success = true;
    this.status = null;
    this.data = [];
    this.message = "";
    this.source = "";
    this.pagination = null; // Holds pagination data if provided
  }
}

export class ErrorResponse {
  constructor(status, message, source) {
    this.status = status;
    this.message = message;
    this.source = source;
  }
  success = false;
  status;
  message;
  source;
}
