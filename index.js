const express=require("express");
const app=express();
const port=8080;
const path=require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const User=require("./models/user.js");
const Post=require("./models/post.js");
main().then(()=> {
    console.log("Connection successful!");
})
.catch(err => console.log(err));
async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/Utopia')
}

app.use(session({
    secret: 'your-secret-key',     
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24  
    }
  }));


app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

app.get("/", (req,res) => {
    res.render('LandingPage.ejs')
});
app.get("/login", (req,res) => {
    res.render('Login.ejs')
});
app.post('/login',async(req,res) => {
    const {username,password} = req.body;
    const user = await User.findOne({username:username});
    if(!user)
    {
        res.send("No user Found! Sign Up First!");
    }
    else
    {
        if(password===user.password)
        {
            req.session.userId=user._id;
            return res.redirect('/Your-account');
        }
        else {
            return res.send("Incorrect password! Please try again.");
        }
    }

});
app.get("/signup", (req,res) => {
    res.render('signup.ejs')
});

app.get('/Your-account',async (req,res) => {
    const currentUser=req.session.userId;
    if (!currentUser) {
        return res.send("You must be logged in to view this page.");
    }
    const allYourPosts=await Post.find({user : currentUser}).sort({created_at : -1});
    
    
    res.render('Your_Account.ejs',{allYourPosts});
    

});
app.post("/your-blog-added", async (req, res) => {
    const currentUserId=req.session.userId;
    const {title, content}=req.body;
    const newPost = new Post({title,content,user:currentUserId,created_at : new Date()});
    await newPost.save();
    res.redirect('/Your-account');
});
app.post('/Account-created', async(req,res) => {
    const{username,password}=req.body;
    const existingUser = await User.findOne({username:username});
    if(!existingUser){
        const newUser = new User({username,password});
        await newUser.save();
        res.redirect('/');
    }
    else
    {
        res.send("Username already taken! Signup with a different username");
    }
    
});

app.post('/delete-post/:id', async (req,res)=> {
    const currentUserId=req.session.userId;
    const postId=req.params.id;
    const post = await Post.findById(postId);
    if (post && post.user.equals(currentUserId)) {
        await Post.findByIdAndDelete(postId);
        res.redirect('/Your-account');
    }
    else
    {
        res.send("You are not logged in!");
    }
});
app.get('/Posts', async(req,res)=> {
    const allPosts=await Post.find({}).sort({created_at: -1}).populate('user');
    res.render('allposts.ejs',{allPosts});    
})
app.get('/write-your-blog', (req,res) => {
    res.render('PostForm.ejs',);
});
app.listen(port, () => {
    console.log("App is listening at port 8080");
});