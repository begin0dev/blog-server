import { model, Schema, Document, Model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';
import crypto from 'crypto';

import { StrategiesNames } from '@app/lib/oauth/types';

interface UserBase {
  email?: string;
  displayName: string;
  profileImage?: string;
  isAdmin: boolean;
  emailVerified: boolean;
}

export interface UserJson extends UserBase {
  _id: string;
}

export interface UserSchema extends Document, UserBase {
  oAuth?: {
    local?: {
      refreshToken: string;
      expiredAt: Date;
    };
    facebook?: { id: Number };
    github?: { id: Number };
    google?: { id: Number };
    kakao?: { id: Number };
  };
}

const User = new Schema(
  {
    email: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    displayName: { type: String, required: true },
    profileImage: String,
    emailVerified: Boolean,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    oAuth: {
      local: {
        refreshToken: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
        expiredAt: Date,
      },
      facebook: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
      github: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
      google: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
      kakao: {
        id: {
          type: String,
          sparse: true,
          unique: true,
          index: true,
        },
      },
    },
  },
  { timestamps: true },
);

User.plugin(mongooseDelete, { deletedAt: true });

User.set('toJSON', {
  transform({ _id, email, emailVerified, displayName, profileImage, isAdmin }: UserJson) {
    return {
      _id,
      email,
      emailVerified,
      displayName,
      profileImage,
      isAdmin,
    };
  },
});

// static methods
export interface UserModel extends Model<UserSchema> {
  findBySocialId(provider: StrategiesNames, id: Number): Promise<UserSchema> | Promise<null>;
  findByRefreshToken(refreshToken: string): Promise<UserSchema> | Promise<null>;
  socialRegister(params: {
    provider: StrategiesNames;
    id: string;
    email?: string;
    displayName: string;
    profileImage?: string;
  }): Promise<UserSchema>;
}

User.statics.findByRefreshToken = function (refreshToken: string) {
  return this.findOne({ 'oAuth.local.refreshToken': refreshToken });
};

User.statics.findBySocialId = function (provider: StrategiesNames, id: Number) {
  return this.findOne({ [`oAuth.${provider}.id`]: id });
};

User.statics.socialRegister = async function ({
  provider,
  id,
  email,
  displayName,
}: {
  provider: StrategiesNames;
  id: string;
  email?: string;
  displayName: string;
}) {
  const emailVerified = email?.length > 0;
  let profileImage;
  if (emailVerified)
    profileImage = `https://s.gravatar.com/avatar/${crypto.createHash('md5').update(email).digest('hex')}`;

  const user = new this({
    email,
    displayName,
    emailVerified,
    profileImage,
    oAuth: { [provider]: { id } },
  });
  return user.save();
};

export default model<UserSchema, UserModel>('User', User);
