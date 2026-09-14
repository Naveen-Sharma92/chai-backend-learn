import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinery.js"
import { ApiResponse } from "../utils/ApiResponse.js"
const registerUser = asyncHandler(async (req, res) => {
    //steps
    //get user details from frontend
    //validation-not empty
    //check if user already exists:using username and email
    //check for images
    //check for avatars
    //upload them to cloudnerry, check avatar is uploaded or not 
    //create user object and create db entery 
    //remove pass and referesh token from response and check for reponse //
    // and check for user creation
    // return response

    //get user details from frontend
    const { fullName, email, username, password } = req.body;
    console.log("email: ", email);
    //validation
    /*
    if(fullname==""){
        throw new ApiError(400,"fullname not written")
    } //similiarly other but can use .some to do all at same time
     */
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
    //check if user already exists:using username and email
    const existeduser = await User.findOne({
        $or: [{ email }, { username }]
    })
    if (existeduser) {
        throw new ApiError(409, "user already existed")
    }

    //check for images check for avatars
    const avatarLocalPath = req.files?.avatar[0]?.path; //multer .files is used to get file location of local store avatar
    const coverImageLocalPath = req.files?.coverImage[0]?.path;//multer .files is used to get file location of local store coverImage

    if (!avatarLocalPath) {
        throw new ApiError(400, "NO Avatar is missing fill it");
    }
    if (!coverImageLocalPath) {
        throw new ApiError(400, "NO CoverImage is missing fill it");
    }
    //now upload on cloudnerry 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    //check if upload or not
    if (!avatar) {
        throw new ApiError(400, "avatar not found on cloudnerry")
    }

    //create user object and create db entery
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", //means if no url of coverImage just empty
        email,
        password,
        username: username.toLowerCase()
    })
    //check if db entry is made or not
    //remove pass and referesh token from response and check for reponse .select is used for this
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"  // in select -password means select everything but not password and refreshTOken 
    )
    if (!createdUser) {
        throw new ApiError(500, "Data entry not created in db")
    }
    // return response
    res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )

})

export { registerUser }