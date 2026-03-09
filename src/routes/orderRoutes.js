const express = require('express');
const orderController = require('../controllers/orderController');
const verifyToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Aplica a validação JWT como middleware injetado na fileira de execução do endpoint
router.post('/order', verifyToken, orderController.createOrder);
router.get('/order/list', verifyToken, orderController.getAllOrders);
router.get('/order/:id', verifyToken, orderController.getOrderById);
router.put('/order/:id', verifyToken, orderController.updateOrder);
router.delete('/order/:id', verifyToken, orderController.deleteOrder);

module.exports = router;
