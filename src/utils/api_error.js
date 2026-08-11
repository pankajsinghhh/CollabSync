class ApiError extends Error{
    constructor(
        statuscode, message = "something got out", errors = [], stack = "") {
        super(message)
        this.statuscode = statuscode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors
        if (stack) {
            this.stack = stack
        }
        else {
            Error.captureStackTrace(this, this.contructor());
        }
    }
}
export { ApiError };