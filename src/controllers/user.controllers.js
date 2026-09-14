import { asyncHandler } from "../utils/asyncHandler";

const registerUser = asyncHandle(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})

export { registerUser }