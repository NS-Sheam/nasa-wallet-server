import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/appError.js";
import { PasswordHelper } from "../../utils/passwordHelpers.js";
import { User } from "../user/user.model.js";
import { JwtHelpers } from "../../utils/jwtHelpers.js";
import config from "../../config/index.js";
const login = async (payload) => {
  const { mobileNumberOrEmail, password, deviceId } = payload;

  if (!mobileNumberOrEmail || !password || !deviceId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Mobile number/email, PIN, and device ID are required!");
  }

  const isUserExist = await User.findOne({
    $or: [{ mobileNumber: mobileNumberOrEmail }, { email: mobileNumberOrEmail }],
  });

  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User not found!");
  }

  if (!isUserExist.isActive) {
    throw new AppError(StatusCodes.FORBIDDEN, "This user is blocked!");
  }
  if (!isUserExist.isVerified) {
    throw new AppError(StatusCodes.FORBIDDEN, "This user is not verified!");
  }

  const isPasswordMatch = await PasswordHelper.comparePassword(password, isUserExist.password);
  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.FORBIDDEN, "PIN is incorrect!");
  }

  isUserExist.deviceId = deviceId;
  isUserExist.lastLogin = Date.now();
  await isUserExist.save();
  const jwtPayload = {
    id: isUserExist._id,
    email: isUserExist.email,
    mobileNumber: isUserExist.mobileNumber,
    role: isUserExist.role,
    deviceId: deviceId,
  };

  const accessToken = await JwtHelpers.createToken(jwtPayload, config.jwt.access_secret, config.jwt.access_expires_in);

  const refreshToken = await JwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (user, payload) => {
  const { oldPassword, newPassword } = payload;

  const isUserExist = await User.findById(user.id);
  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User not found!");
  }

  const isPasswordMatch = await PasswordHelper.comparePassword(oldPassword, isUserExist.password);
  if (!isPasswordMatch) {
    throw new AppError(StatusCodes.FORBIDDEN, "Old password is incorrect");
  }

  const hashedPassword = await PasswordHelper.hashedPassword(newPassword);
  if (!hashedPassword) {
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Error hashing password");
  }

  await User.findByIdAndUpdate(user.id, { password: hashedPassword }, { new: true });
  const result = await User.findById(user.id).select("-password");
  return result;
};

export const AuthService = { login, changePassword };
