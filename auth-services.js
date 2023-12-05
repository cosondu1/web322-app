import mongoose from "mongoose";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from './user-model';

dotenv.config();

const Schema = mongoose.Schema;
const userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }],
});

let User;


export const initialize = async () => {
    try {
        const db = await mongoose.createConnection(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        global.User = db.model('users', userSchema);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw err;
    }
};


const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

const createUser = async (userName, hash, email) => {
    const newUser = new User({ userName, password: hash, email, loginHistory: [] });
    await newUser.save();
};

export const registerUser = async (userData) => {
    if (userData.password !== userData.password2) {
        throw new Error("Passwords do not match");
    }

    const hash = await hashPassword(userData.password);
    
    try {
        await createUser(userData.userName, hash, userData.email);
    } catch (err) {
        if (err.code === 11000) {
            throw new Error("User Name already taken");
        } else {
            throw new Error("There was an error creating the user: " + err.message);
        }
    }
};


const findUserByUsername = async (userName) => {
    const user = await User.findOne({ userName });
    if (!user) throw new Error(`Unable to find user: ${userName}`);
    return user;
};

const validatePassword = async (inputPassword, userPassword) => {
    const isPasswordValid = await bcrypt.compare(inputPassword, userPassword);
    if (!isPasswordValid) throw new Error("Incorrect Password");
    return isPasswordValid;
};

const updateUserLoginHistory = async (userName, userAgent) => {
    await User.updateOne(
        { userName },
        { $push: { loginHistory: { dateTime: new Date().toString(), userAgent } } }
    );
};

export const checkUser = async (userData) => {
    try {
        const user = await findUserByUsername(userData.userName);
        await validatePassword(userData.password, user.password);
        await updateUserLoginHistory(userData.userName, userData.userAgent);
        return user;
    } catch (err) {
        throw new Error(`There was an error processing the request: ${err.message}`);
    }
};
