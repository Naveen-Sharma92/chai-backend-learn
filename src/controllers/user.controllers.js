import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinery.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"


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

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        //we add refresh token in database also
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }) // as ho sakta hai ki save se pahle wali condition hai ki password hona chahiye wo na ho to yeh save nahi karega but hum save karna chahte hai

        return { accessToken, refreshToken }
    }
    catch (error) {
        console.log("TOKEN GENERATION ERROR:", error);
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const loginUser = asyncHandler(async (req, res) => {
    //re body se data
    //username or email
    //find the user
    //password check
    //pssword is right then access and refresh token generate
    //send token with cookies
    // return that login is done

    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");

    }
    const user = await User.findOne({
        $or: [{ username }, { email }] //find in user database either i got the username or i got the email
    })

    if (!user) {
        throw new ApiError(404, "User does not exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password); // User is db sachema and user is a instance of the object of that that user that is used

    if (!isPasswordValid) {
        throw new ApiError(401, "Password is wrong");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // we define user instance than update(add refreahToken) it in db but we have older version before update in user as it is instance
    // either we update our user or get user from db again
    // we get from db sometimes it can take time

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") //as we do not want to return password and refresh token
    //now send cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options) //key,value,options
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "user logged in successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options) // to clear accesstoken from cookie
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}