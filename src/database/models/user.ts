import { model, Schema, Document, Model } from 'mongoose';
import mongooseDelete from 'mongoose-delete';

import { StrategiesNames } from '@app/lib/oauth/types';

interface UserBase {
  email?: string;
  displayName: string;
  profileImageUrl?: string;
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
    email: String,
    displayName: { type: String, required: true },
    profileImageUrl: String,
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
  transform({ _id, email, displayName, profileImageUrl }) {
    return {
      _id,
      email,
      displayName,
      profileImageUrl,
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
    profileImageUrl?: string;
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
  profileImageUrl,
}: {
  provider: StrategiesNames;
  id: string;
  email?: string;
  displayName: string;
  profileImageUrl?: string;
}) {
  const user = new this({
    email,
    displayName,
    profileImageUrl,
    oAuth: { [provider]: { id } },
  });
  return user.save();
};

export default model<UserSchema, UserModel>('User', User);
