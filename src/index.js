require('dotenv').config();
const express = require('express');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global para parse de JSON bodies
app.use(express.json());

// Registro das rotas raiz
app.use('/', orderRoutes);

// Handling básico pra evitar que reqs pra rotas não existentes derrubem a aplicação (opcional, boa prática)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint não encontrado' });
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
