const jsonwebtoken = require('jsonwebtoken');
const Userdata = require('../modules/users');
const Cookies = require('cookies');

const auth = async (req, res, next)=>{
    try {
        const cookies = new Cookies(req,res);
        const token = cookies.get('token');
        const verifyUser = jsonwebtoken.verify(token,process.env.SECRET_KEY);
        const user = await Userdata.findOne({_id:verifyUser._id});

        req.token=token;
        req.user=user;
        next();
    } catch (error) {
        res.status(401).send("You cannot access this page without login.");
    }
};

module.exports = auth;