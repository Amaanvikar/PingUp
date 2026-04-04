import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
    user_id: {type: String, require: true, ref: 'User'},
    content: {type: String},
    media_url: {type: String},
    media_type: {type: String, enum: ['image', 'video', 'text']},
    view_count: {type: Number, default: 0},
    background_color: {type: String, default: '#4f46e5'},
}, {timestamps: true, minimize:false})


const Story = mongoose.model('Story', StorySchema)

export default Story;