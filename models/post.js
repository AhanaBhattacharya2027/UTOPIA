const mongoose=require("mongoose");
const postSchema=new mongoose.Schema({
    title : String,
    content : String,
    user : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    created_at :{
        type: Date,
        default: Date.now
    }
});
const Post = mongoose.model('Post', postSchema);
module.exports = Post;