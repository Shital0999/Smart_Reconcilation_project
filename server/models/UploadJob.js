const mongoose = require("mongoose");

const uploadJobSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        default: "Processing"
    },
    totalRecords: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("UploadJob", uploadJobSchema);
