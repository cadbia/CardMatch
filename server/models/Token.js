import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
       // type: ObjectId,
        required: true,
        ref: "user",
    },
    token:{
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },

});

export default mongoose.model('Token', tokenSchema);