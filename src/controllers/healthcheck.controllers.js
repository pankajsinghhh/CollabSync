import { ApiResponse } from "../utils/api_response.js";
import { asynchandler } from "../utils/async_handler.js";

// const healthcheck = async (req, res, next) => {
//     try {
//         res.status(200)
//             .json(new ApiResponse(200, { message: "server is running" }))
//     } catch (error) {
//         next(error)
//     }
// };
const healthcheck = asynchandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(200, {
            message: "server is running"
        })
    );
});
export { healthcheck };