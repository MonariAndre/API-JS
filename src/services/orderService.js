const db = require('../database');

/**
 * Criação da ordem com de-para e integridade relacional.
 * Arquiteturalmente, a Service orquestra as regras mas deixa as validações finas para um middleware futuro.
 */
async function createOrder(payload) {
    if (!payload.numeroPedido || payload.valorTotal === undefined || !payload.dataCriacao || !Array.isArray(payload.items) || payload.items.length === 0) {
        throw new Error('Erro ao mapear os dados do pedido: Campos obrigatórios do pedido ausentes ou formato inválido.');
    }

    // De-Para exato com base no payload definido
    const mappedOrder = {
        orderId: payload.numeroPedido,
        value: payload.valorTotal,
        creationDate: new Date(payload.dataCriacao).toISOString(),
        items: payload.items.map(item => {
            if (!item.idItem || item.quantidadeItem === undefined || item.valorItem === undefined) {
                throw new Error('Erro ao mapear os dados do pedido: Campos obrigatórios do item ausentes.');
            }
            return {
                productId: Number(item.idItem),
                quantity: item.quantidadeItem,
                price: item.valorItem
            };
        })
    };

    const client = await db.getClient();

    try {
        // Isolamento transacional na camada de persistência para Atomicidade (ACID)
        await client.query('BEGIN');

        const insertOrderQuery = `
      INSERT INTO "Order" ("orderId", "value", "creationDate")
      VALUES ($1, $2, $3)
    `;
        await client.query(insertOrderQuery, [
            mappedOrder.orderId,
            mappedOrder.value,
            mappedOrder.creationDate
        ]);

        const insertItemQuery = `
      INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
      VALUES ($1, $2, $3, $4)
    `;

        for (const item of mappedOrder.items) {
            await client.query(insertItemQuery, [
                mappedOrder.orderId,
                item.productId,
                item.quantity,
                item.price
            ]);
        }

        await client.query('COMMIT');

        // Retorna a estrutura já englobando as entidades após o bind com banco
        return mappedOrder;

    } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erro ao mapear os dados do pedido / Falha na transação: ${error.message}`);
    } finally {
        // Retorna a conexão para o pool previnindo vazamentos (leak)
        client.release();
    }
}

async function getOrderById(orderId) {
    const orderResult = await db.query('SELECT * FROM "Order" WHERE "orderId" = $1', [orderId]);
    if (orderResult.rows.length === 0) return null;

    const itemsResult = await db.query('SELECT * FROM "Items" WHERE "orderId" = $1', [orderId]);

    return {
        ...orderResult.rows[0],
        items: itemsResult.rows
    };
}

async function getAllOrders() {
    const result = await db.query('SELECT * FROM "Order" ORDER BY "creationDate" DESC');
    return result.rows;
}

async function updateOrder(orderId, payload) {
    const existingOrder = await getOrderById(orderId);
    if (!existingOrder) return null;

    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Dependendo da lógica de negócio, a atualização pode ser parcial ou total.
        // Aqui assumimos atualização financeira agregada do pedido.
        if (payload.valorTotal !== undefined) {
            await client.query('UPDATE "Order" SET "value" = $1 WHERE "orderId" = $2', [payload.valorTotal, orderId]);
        }

        // Se itens forem repassados na requisição de PUT, recriamos a lista na transação
        if (payload.items && Array.isArray(payload.items)) {
            await client.query('DELETE FROM "Items" WHERE "orderId" = $1', [orderId]);

            const insertItemQuery = `
        INSERT INTO "Items" ("orderId", "productId", "quantity", "price")
        VALUES ($1, $2, $3, $4)
      `;
            for (const item of payload.items) {
                await client.query(insertItemQuery, [
                    orderId,
                    Number(item.idItem),
                    item.quantidadeItem,
                    item.valorItem
                ]);
            }
        }

        await client.query('COMMIT');
        return await getOrderById(orderId);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function deleteOrder(orderId) {
    // A constraint ON DELETE CASCADE na tabela de Items fará a limpeza atrelada automaticamente 
    const result = await db.query('DELETE FROM "Order" WHERE "orderId" = $1 RETURNING "orderId"', [orderId]);
    return result.rowCount > 0;
}

module.exports = {
    createOrder,
    getOrderById,
    getAllOrders,
    updateOrder,
    deleteOrder
};
