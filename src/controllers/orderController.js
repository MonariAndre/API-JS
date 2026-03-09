const orderService = require('../services/orderService');

async function createOrder(req, res) {
    try {
        const order = await orderService.createOrder(req.body);
        return res.status(201).json(order);
    } catch (error) {
        if (error.message.includes('Erro ao mapear')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

async function getOrderById(req, res) {
    try {
        const order = await orderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        return res.status(200).json(order);
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

async function getAllOrders(req, res) {
    try {
        const orders = await orderService.getAllOrders();
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

async function updateOrder(req, res) {
    try {
        const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Pedido não encontrado para atualização' });
        }
        return res.status(200).json(updatedOrder);
    } catch (error) {
        if (error.message.includes('Erro ao mapear')) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

async function deleteOrder(req, res) {
    try {
        const deleted = await orderService.deleteOrder(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Pedido não encontrado para exclusão' });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
}

module.exports = {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrder,
    deleteOrder
};
