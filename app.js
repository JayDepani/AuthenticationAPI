require('dotenv').config();
const express = require('express');
const app = express();
const router = require('./server/router/router');
const path = require('path');
const session = require('express-session');
require('./server/database/connection');
const port = process.env.PORT || 8000;

// Absolute paths
const staticFolderPath = path.join(__dirname,"public");

app.use(express.static(staticFolderPath));
app.set('view engine','ejs');
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret:process.env.SECRET_VALUE,
    resave:false,
    saveUninitialized:true
}));


// Routers
app.use(router);


app.listen(port,()=>{
    console.log(`Server listening on port no ${port}...`);
});
