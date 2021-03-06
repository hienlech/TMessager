const express = require('express');
const app = express();
const authentication = require('./authentication/authentication');
const User = require('./authentication/User');
const bodyParser = require('body-parser');
const chatSocket = require('./ChatServer/ChatSocket');
const registerService = require('./RegisterService/RegisterService');



//Connect Socket.io
let server = app.listen(3000, () => console.log("Application start on port 3000..."));


const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
app.use(session);


//Tạo máy chủ chat Realtime
chatSocket.init(server, session);

//no cache
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});





app.use(express.static("public"));
app.use(authentication);
app.use(bodyParser.urlencoded({
    extended: true
}));





//Route 
app.get("/", function (req, res) {

    if (req.session.user) {
        res.sendFile('Message/index.html', {
            root: __dirname
        });
    } else
        res.sendFile('./authentication/login.html', {
            root: __dirname
        })
});

app.get('/register', function (req, res) {
    res.sendFile('./authentication/register.html', {
        root: __dirname
    });
});

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
});
app.post('/register', async function (req, res) {
    registerService.HandleRegister(req, res);
});




app.post("/login", async (req, res) => {
    let user = new User.ApplicationUser({
        username: req.body.username,
        password: req.body.password
    });



    let result = await User.Login(user);
    if (result) {
        req.session.user = result;
        res.redirect("/");
    } else
        res.redirect("/");
});
app.get("/home", (req, res) => {
    res.sendFile('Message/index.html', {
        root: __dirname
    });


});