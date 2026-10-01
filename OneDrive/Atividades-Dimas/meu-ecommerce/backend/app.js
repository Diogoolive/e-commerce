const express = require('express');
const app = express();
const PORT = 3000;

app.get("/",(req,res) =>{
    res.send("Olá Node.js e Express")
});

app.listen(PORT, () => {
    console.log('Servidor rodando em http://localhost:${port}');
});
