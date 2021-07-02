const multer = require('multer');

// set storage
let Storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'public/profileImages')
    },
    filename:function(req,file,cb){
        // image.jpg
        let ext = file.originalname.substr(file.originalname.lastIndexOf('.'));

        cb(null,file.fieldname+"-"+Date.now()+ext)
    }
});

var upload = multer({
    storage:Storage
}).single('filename'); 

module.exports = upload;