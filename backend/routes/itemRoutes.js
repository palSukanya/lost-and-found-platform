const express = require("express");
const itemController = require("../controllers/itemController");
const verifyToken = require("./authRoutes").verifyToken;

// ✅ Cloudinary upload middleware (NEW)
const upload = require("../middleware/upload");

const router = express.Router();

// ✅ POST /api/items - Create lost/found item (FormData + image)
router.post("/", verifyToken, upload.single("image"), itemController.createItem);

// ✅ GET /api/items?type=lost&category=Electronics - Fetch items
router.get("/", verifyToken, itemController.getItems);

// ✅ NEW: POST /api/items/:id/claim - Submit claim with verification answers
router.post("/:id/claim", verifyToken, itemController.submitClaim);

// ✅ NEW: POST /api/items/:id/approve - Finder approves claim
router.post("/:id/approve", verifyToken, itemController.approveClaim);

// ✅ NEW: POST /api/items/:id/reject - Finder rejects claim
router.post("/:id/reject", verifyToken, itemController.rejectClaim);

// ✅ Backward compatibility: PUT /api/items/:id/claim - Simple claim
router.put("/:id/claim", verifyToken, itemController.claimItem);

// ✅ POST /api/items/messages - Send message about item
router.post("/messages", verifyToken, itemController.sendMessage);

module.exports = router;
