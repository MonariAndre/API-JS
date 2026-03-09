const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-keep-it-safe';

async function login(req, res) {
    const { username, password } = req.body;

    // Em um cenário real, você validaria com dados do Banco de Dados (ex: bcrypt.compare).
    // Para este teste técnico, vamos hardcodar um usuário simples "admin" / "admin"
    if (username === 'admin' && password === 'admin') {
        // Gerando o token assinado. Expira em 2 horas
        const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '2h' });

        return res.status(200).json({
            message: 'Autenticação bem sucedida',
            token
        });
    }

    return res.status(401).json({ error: 'Credenciais inválidas' });
}

module.exports = {
    login
};
