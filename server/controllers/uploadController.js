const UploadJob = require("../models/UploadJob");
const Record = require("../models/Record");
const csv = require("csv-parser");
const fs = require("fs");


// ========================
// UPLOAD API
// ========================
exports.uploadFile = async (req, res) => {
    console.log("File received:", req.file);

    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const job = await UploadJob.create({
            fileName: req.file.filename,
            uploadedBy: req.user.id,
            status: "Processing"
        });

        res.json({
            message: "File uploaded. Processing started.",
            jobId: job._id
        });

        setImmediate(() => processFile(req.file.path, job._id));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};


// ========================
// PROCESS FILE FUNCTION
// ========================
async function processFile(filePath, jobId) {
    try {
        const records = [];
        const transactionSet = new Set();

        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {

                const transactionId = row.transactionId;
                const amount = parseFloat(row.amount);
                const referenceNumber = row.referenceNumber;

                let status = "Unmatched";

                if (transactionSet.has(transactionId)) {
                    status = "Duplicate";
                } else {
                    transactionSet.add(transactionId);
                }

                records.push({
                    uploadJobId: jobId,
                    transactionId,
                    amount,
                    referenceNumber,
                    date: new Date(row.date),
                    status
                });
            })
            .on("end", async () => {

                // Reconciliation Logic
                for (let i = 0; i < records.length; i++) {
                    for (let j = i + 1; j < records.length; j++) {

                        if (
                            records[i].transactionId === records[j].transactionId &&
                            records[i].amount === records[j].amount
                        ) {
                            records[i].status = "Matched";
                            records[j].status = "Matched";
                        }

                        const variance = records[j].amount * 0.02;

                        if (
                            records[i].referenceNumber === records[j].referenceNumber &&
                            Math.abs(records[i].amount - records[j].amount) <= variance
                        ) {
                            records[i].status = "Partial";
                            records[j].status = "Partial";
                        }
                    }
                }

                await Record.insertMany(records);

                await UploadJob.findByIdAndUpdate(jobId, {
                    status: "Completed",
                    totalRecords: records.length
                });

                console.log("Reconciliation completed successfully");
            });

    } catch (error) {
        console.error(error);
    }
}


// ========================
// DASHBOARD SUMMARY API
// ========================
exports.getDashboardSummary = async (req, res) => {
    try {
        const total = await Record.countDocuments();
        const matched = await Record.countDocuments({ status: "Matched" });
        const unmatched = await Record.countDocuments({ status: "Unmatched" });
        const duplicate = await Record.countDocuments({ status: "Duplicate" });
        const partial = await Record.countDocuments({ status: "Partial" });

        res.json({
            total,
            matched,
            unmatched,
            duplicate,
            partial
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// ========================
// GET ALL RECORDS API
// ========================
exports.getRecords = async (req, res) => {
    try {
        const records = await Record.find();
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
