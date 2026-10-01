// db.js
const mysql = require('mysql2');

// Configurações padrão do XAMPP (usuário 'root' e sem senha)
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'e_commerce',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exporta a conexão usando Promises (permite usar async/await)
module.exports = pool.promise();