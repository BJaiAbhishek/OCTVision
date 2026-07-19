import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const { Schema } = mongoose;

const userSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        index:true,
    },
    password:{
        type:String,
        required: function () { return !this.googleId; }
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, { timestamps: true })

userSchema.pre('save', async function () {
    if (!this.password) return;
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

export const User = mongoose.model("User",userSchema);
