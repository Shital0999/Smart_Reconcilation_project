const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    uploadJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UploadJob"
    },
    transactionId: String,
    amount: Number,
    referenceNumber: String,
    date: Date,
    status: String
}, { timestamps: true });

module.exports = mongoose.model("Record", recordSchema);

recordSchema.index({ transactionId: 1 });
recordSchema.index({ referenceNumber: 1 });
recordSchema.index({ uploadJobId: 1 });
