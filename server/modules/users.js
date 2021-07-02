const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        minLength:3
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Invalide Email");
            }
        }
    },
    phone:{
        type:Number,
        required:true,
        min:10
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    profileImg:{
        type:String,
        required:true
    },
    resetToken:{
        type:String,
    },
    expireToken:{
        type:Date
    }
});


registerSchema.methods.generateToken = async function(){
    try {
        const token = jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        return token;
    } catch (error) {
        console.log(error);
    }
}



// registerSchema.pre("save",async function(next){
//     if(this.isModified("password")){
//         this.password = await bcryptjs.hash(this.password,10);
//         this.cpassword = await bcryptjs.hash(this.cpassword,10);
//     }
//     next();
// });



const Userdata = new mongoose.model('Users',registerSchema);


module.exports = Userdata;