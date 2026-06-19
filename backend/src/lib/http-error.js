// Error carrying an HTTP status and a client-safe message.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.publicMessage = message;
  }
}

module.exports = HttpError;
