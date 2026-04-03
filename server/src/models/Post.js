import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    user_id: {type: String,ref: 'User', required: true },
    content: {type: String},
    image_url: [{type: String }],
    post_type: {type: String, enum: ['text', 'image', 'text_with_image'], required: true, default: 'text'},
    like_count: [{type: String, ref: 'User'}],
}, {timestamps: true, minimize: false});

const post = mongoose.model('Post', postSchema);

export default post;