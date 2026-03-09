const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-keep-it-safe';

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    // Verifica se o header Authorization com Bearer token foi enviado
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Token de acesso não fornecido ou inválido' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // Valida o token matematicamente usando a chave JWT_SECRET
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // injeta os dados do usuário na request pro controller usar caso queira

        next(); // Passa o controle pro próximo middleware / rota do Express
    } catch (err) {
        return res.status(401).json({ error: 'Token expirado ou inválido' });
    }
}

module.exports = verifyToken;
