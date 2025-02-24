import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

interface RefreshToken {
  token: string;
  issuedAt: Date;
  expiresAt: Date;
  isRevoked: boolean;
  device?: string;
}

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  refreshTokens: RefreshToken[];
  lastLogin?: Date;
  passwordChangedAt?: Date;
  isValidPassword(password: string): Promise<boolean>;
  addRefreshToken(token: string): Promise<void>;
  revokeRefreshToken(token: string): Promise<void>;
  cleanupExpiredTokens(): Promise<void>;
}

const refreshTokenSchema = new Schema<RefreshToken>({
  token: { type: String, required: true },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  isRevoked: { type: Boolean, default: false },
  device: { type: String },
});

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    refreshTokens: [refreshTokenSchema],
    lastLogin: Date,
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.passwordChangedAt = new Date();
  next();
});

userSchema.methods.isValidPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.addRefreshToken = async function (
  token: string,
  device?: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  this.refreshTokens.push({
    token,
    expiresAt,
    issuedAt: new Date(),
    isRevoked: false,
    device,
  });

  await this.save();
};

userSchema.methods.revokeRefreshToken = async function (
  token: string
): Promise<void> {
  const tokenDoc = this.refreshTokens.find(
    (t: { token: string }) => t.token === token
  );
  if (tokenDoc) {
    tokenDoc.isRevoked = true;
    await this.save();
  }
};

userSchema.methods.cleanupExpiredTokens = async function (): Promise<void> {
  this.refreshTokens = this.refreshTokens.filter(
    (token: RefreshToken) => !token.isRevoked && token.expiresAt > new Date()
  );
  await this.save();
};

userSchema.index({ email: 1 });
userSchema.index({ "refreshTokens.token": 1 });

const UserModel = mongoose.model<IUser>("Users", userSchema);

export default UserModel;
