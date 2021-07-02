const Userdata = require('../modules/users');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const bcryptjs = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');

app.use(cookieParser());
let userID = '';

exports.gethome = async (req,res)=>{
    const user = Userdata.findOne({_id:req.user});
    res.render('index',{
        imagename:user.profileImg,
        name:user.name,
        emailID:user.email,
        phoneNo:user.phone,
        resetMsg:'',
        userID
    });
}

exports.getregister = async (req,res)=>{
    res.render('register',{
        userID
    });
}

exports.getlogin = async (req,res)=>{
    res.render('login',{
        userID
    });
}

exports.postregister = async (req,res)=>{
    try {
        let password = req.body.password;
        let cpassword = req.body.cpassword;
        if(password === cpassword){
            password = await bcryptjs.hash(password,10);
            cpassword = await bcryptjs.hash(cpassword,10);
            const userRegister = new Userdata({
                name:req.body.name,
                email:req.body.email,
                phone:req.body.phone,
                profileImg:req.file.filename,
                password,cpassword,
                resetToken:'',
                expireToken:''
            });

            const register = await userRegister.save();
            if(register){
                const userData = await Userdata.findOne({email:req.body.email});
                userID = userData._id;
            }
            

            res.status(201).render('login',{
                userID
            });
            
        }else{
            res.send('Password are not matching');
        }
        
    } catch (error) {
        console.log(error);
    }
}

exports.postlogin = async (req,res)=>{
    try{
        const username = req.body.username;
        const password = req.body.password;
        let userData = '';

        if(validator.isEmail(username)){
            userData = await Userdata.findOne({email:username});
        }else{
            userData = await Userdata.findOne({phone:username});
        }
        
        if(userData != null){
            const isMatch = await bcryptjs.compare(password,userData.password);
            if(isMatch){
                const token = await userData.generateToken();
                userID = userData._id;

                res.cookie('token',token,{
                    expires:new Date(Date.now() + 86400000),
                    httpOnly:true
                });

                res.status(200).render('index',{
                    imagename:userData.profileImg,
                    name:userData.name,
                    emailID:userData.email,
                    phoneNo:userData.phone,
                    resetMsg:'',
                    userID
                });
            }else{
                res.send('Password are not matching');
            }
        }else{
            res.send('Email or phone no are not matching');
        }
    }catch(error){
        res.status(500).send(error);
    }
}


const sendmail = async (email,subject,htmlText)=>{
    try {

        "use strict";
        const nodemailer = require("nodemailer");

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, 
            auth: {
            user: "jdcoder007@gmail.com", 
            pass: "jdcodersecondary@007", 
            },
        });

        let info = await transporter.sendMail({
            from: '"Registration API" <jdcoder007@gmail.com>', 
            to: email, 
            subject: subject, 
            html: htmlText, 
        });

        if(info.messageId){
            return "Sent";
        }else{
            return "Not Sent";
        }

    } catch (error) {
        res.status(500).send(error);
    }
}

exports.forgot_password = async(req,res)=>{
    res.status(200).render('forgot_password',{
        forgotpasswordMsg:''
    });
}

exports.forgot_sendmail = async(req,res)=>{
    const email = req.body.email;
    const userdata =  await Userdata.findOne({email});
    const token = await userdata.generateToken();
    userdata.resetToken = token;
    userdata.expireToken = Date.now() + 3600000;
    const user = await userdata.save();
    const subject = "Forgot Password Email"; 
    const htmlText = `<h4>Click in this <a href="http://localhost:8000/reset_password/${token}">link</a> to Forgot your password.</h4>`;
    const result = await sendmail(user.email,subject,htmlText);
    if(result === 'Sent'){
        res.status(200).render('forgot_password',{
            forgotpasswordMsg:"Check your email for Forgot password",
        })
    }else{
        res.status(500).render('forgot_password',{
            forgotpasswordMsg:"Email not send due to server error",
        })
    }

}

exports.reset_password_mail = async (req,res)=>{
    try {
        
        const userdata =  await Userdata.findOne({_id:userID});
        const token = await userdata.generateToken();
        userdata.resetToken = token;
        userdata.expireToken = Date.now() + 3600000;
        const user = await userdata.save();

        const subject = "Reset Password Email"; 
        const htmlText = `<h4>Click in this <a href="http://localhost:8000/reset_password/${token}">link</a> to reset your password.</h4>`;
        const result = await sendmail(user.email,subject,htmlText);

        if(result === 'Sent'){
            res.status(200).render('index',{
                resetMsg:"Check your email for reset password",
                imagename:user.profileImg,
                name:user.name,
                emailID:user.email,
                phoneNo:user.phone,
                userID
            })
        }else{
            res.status(500).render('index',{
                resetMsg:"Email not send due to server error",
                imagename:user.profileImg,
                name:user.name,
                emailID:user.email,
                phoneNo:user.phone,
                userID
            })
        }
       
    } catch (error) {
        res.status(500).send(error);
    }
}

exports.reset_password = async (req,res)=>{

    const senttoken = req.params.token;
    const user = await Userdata.findOne({resetToken:senttoken,expireToken:{$gt:Date.now()}});
    if(user){
        userID = user._id;
        res.status(200).render('reset_password',{
            userID
        });
    }else{
        res.status(422).send("Try again session expired");
    }
}

exports.post_reset_password = async (req,res)=>{
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    const user = await Userdata.findOne({_id:userID});
    if(password === cpassword){
        user.password = await bcryptjs.hash(password,10);
        user.cpassword = await bcryptjs.hash(cpassword,10);
        user.resetToken = undefined;
        user.expireToken = undefined;
        const saveuser = await user.save();
        if(saveuser){
            res.status(200).render('login',{
                userID
            });
        }


    }else{
        res.status(422).send("password are not same");
    }
}

exports.getlogout = async (req,res)=>{
    try {

        res.clearCookie('token');
        req.session.destroy();
        userID = '';

        res.render('login',{
            userID
        });
    } catch (error) {
        res.status(500).send(error);
    }
}

