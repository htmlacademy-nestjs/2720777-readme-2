import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findAllEmails(): Promise<string[]> {
    const users = await this.userModel.find({}, { email: 1 }).exec();
    return users.map((u) => u.email);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.userModel.updateOne({ _id: id }, { passwordHash }).exec();
  }

  async subscribe(userId: string, targetId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { subscriptions: targetId } },
    );
    await this.userModel.updateOne(
      { _id: targetId },
      { $addToSet: { subscribers: userId } },
    );
  }

  async unsubscribe(userId: string, targetId: string) {
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { subscriptions: targetId } },
    );
    await this.userModel.updateOne(
      { _id: targetId },
      { $pull: { subscribers: userId } },
    );
  }
}
