const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.post('/order', orderController.createOrder);
router.get('/order/list', orderController.getAllOrders);
router.get('/order/:id', orderController.getOrderById);
router.put('/order/:id', orderController.updateOrder);
router.delete('/order/:id', orderController.deleteOrder);

module.exports = router;
