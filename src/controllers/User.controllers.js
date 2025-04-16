import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    let user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshTokenToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went wrong while generating referesh and access token'
    );
  }
};

export const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, password, role } = req.body;

  // 1. Validate required fields
  if (!email || !role) {
    throw new ApiError(400, 'Email and role are required');
  }

  // 2. Validate role value
  const allowedRoles = ['farmer', 'buyer','admin'];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
    );
  }

  // 3. Username and password validation (only if not Google signup)
  if (
    !req.body.isGoogleAuth &&
    [userName, password].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'Username and password are required');
  }

  // 4. Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    if (existedUser.isGoogleAuth) {
      throw new ApiError(
        409,
        'Email already exists with Google Sign-In. Please use Google login.'
      );
    }
     throw new ApiError(409, 'User with this username or email already exists');
  }

  // 5. Upload profile picture
  const pictureLocalFile = req.file?.path;
  if (!pictureLocalFile) {
    throw new ApiError(400, 'Profile picture is required');
  }

  const picture = await uploadOnCloudinary(pictureLocalFile);
  if (!picture) {
    throw new ApiError(500, 'Error uploading to Cloudinary');
  }

  // 6. Construct new user object
  const newUserData = {
    userName,
    email,
    password,
    role,
    isGoogleAuth: false,
    picture: picture.url,
    pictureId: picture.public_id,
  };
  // 7. Save to database
  const user = await User.create(newUserData);
  const createdUser = await User.findById(user._id).select('userName,name,picture,role');

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, 'User created successfully'));
});

export const googleAuthHandler = asyncHandler(async (req, res) => {
  const { email, name, picture, role } = req.body;

  if (!email || !name) {
    throw new ApiError(400, 'Email and name are required from Google');
  }

  // Check for existing user by email only
  let user = await User.findOne({ email });

  if(user && role){
    throw new ApiError(409, "User with this email already exist")
  }
  if (!user) {
    // No user exists — Signup: role is required
    if (!role) {
      throw new ApiError(400, "Role is required for first-time Google signup");
    }

    // Create new user
    user = await User.create({
      email,
      userName: email.split('@')[0], // fallback
      name,
      picture,
      role,
      isGoogleAuth: true,
    });
  }

  // If user exists but was created with different method (optional check)
  if (!user.isGoogleAuth) {
    throw new ApiError(403, "This email is already registered without Google. Please login manually.");
  }

  // Token generation
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshTokenToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Required for SameSite: 'None'
    sameSite: "None",
  };

  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 1 * 60 * 60 * 1000, // 1 hr
  });

  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 28 * 24 * 60 * 60 * 1000, // 28days
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        accessToken,
        refreshToken,
      },
      user.isNew ? 'Google Signup Success' : 'Google Login Success'
    )
  );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // Check if user is authenticated
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User not authenticated");
  }

  // Remove refreshToken from user in DB
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $unset: { refreshToken: 1 },
    },
    { new: true }
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prepare cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  };

  // Clear tokens from cookies
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  console.log(`User (${user.userName}) logged out successfully`);

  return res.status(200).json(
    new ApiResponse(200, null, "User logged out successfully")
  );
});


export const refreshAccessTokenGenerator = asyncHandler(async (req, res) => {
  const incomingRefereshToken = req.cookies?.refreshToken;
  if (!incomingRefereshToken) {
    throw new ApiError(401, 'Unauthorized Request');
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefereshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, 'Invalid RefreshToken');
    }

    if (incomingRefereshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh Token in Expired or Used');
    }

    const { refreshToken, accessToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const cookieOptions = {
      httpOnly: true,
      secure: true, // Required for SameSite: 'None'
      sameSite: "None",
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 1 * 60 * 60 * 1000, // 1 hr
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 28 * 24 * 60 * 60 * 1000, // 28days
    });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user, refreshToken, accessToken },
          'Access Token Refreshed Successfully'
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || 'Unauthorized Request || Invalid Refresh Token'
    );
  }
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized: No user found');
  }

  const user = await User.findById(userId).select('-password -createdAt -__v -isGoogleAuth'); // exclude password

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user fetched successfully'));
});


export const loginUser = asyncHandler(async (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) {
    throw new ApiError(400, 'Username and password are required');
  }

  const user = await User.findOne({ userName });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isGoogleAuth) {
    throw new ApiError(
      403,
      'This account is registered with Google Sign-In. Please login using Google.'
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid user credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  // ✅ Correct cookie settings for production
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // use true in production
    sameSite: "None", // ✅ critical for cross-site cookies (Vercel <-> Render)
  };

  // ✅ Set cookies with spread
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 1 * 60 * 60 * 1000, // 1 hour
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 28 * 24 * 60 * 60 * 1000, // 28 days
  });
  const userObj = user.toObject();

// Remove unwanted fields
delete userObj.password;
delete userObj.__v;
delete userObj.pictureId;
delete userObj.createdAt;
delete userObj.updatedAt;
  return res.status(200).json(
    new ApiResponse(
      200,
      { userObj, accessToken, refreshToken },
      "User logged in successfully"
    )
  );
});
