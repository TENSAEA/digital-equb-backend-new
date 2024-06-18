const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const authMiddleware = require("../middleware/auth");

router.get("/user/:equbId", authMiddleware, requestController.getUserRequests);
// Route to create a request
router.post("/send", authMiddleware, requestController.createRequest);

// Route to approve a request
router.put("/:id/approve", authMiddleware, requestController.approveRequest);

// Route to reject a request
router.put("/:id/reject", authMiddleware, requestController.rejectRequest);
//Route to delete a request
router.delete("/:id", authMiddleware, requestController.deleteRequest);
module.exports = router;
