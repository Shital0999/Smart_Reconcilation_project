const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const uploadController = require("../controllers/uploadController");
const { authenticate } = require("../middleware/authMiddleware");

// Upload CSV
router.post(
    "/",
    authenticate,
    upload.single("file"),   // 🔥 VERY IMPORTANT
    uploadController.uploadFile
);

// Dashboard Summary
router.get(
    "/dashboard-summary",
    authenticate,
    uploadController.getDashboardSummary
);

// Get All Records
router.get(
    "/records",
    authenticate,
    uploadController.getRecords
);

module.exports = router;
