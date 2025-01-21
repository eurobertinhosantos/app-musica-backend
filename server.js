const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const morgan = require('morgan');

const app = express();
const PORT = 5000; // Porta alterada para evitar conflito com o React

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev')); // Logs de requisições

// Conexão com o Banco de Dados
const db = new sqlite3.Database('./musicas.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criar tabela de músicas
db.run(`
  CREATE TABLE IF NOT EXISTS musicas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    artista TEXT NOT NULL
  )
`);


// Rotas
app.get('/musicas', (req, res) => {
  db.all('SELECT * FROM musicas', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar músicas:', err.message);
      res.status(500).json({ erro: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post('/musicas', (req, res) => {
  const { titulo, artista } = req.body;

  // Validação dos campos
  if (!titulo || !artista) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios!' });
  }

  db.run(
    `INSERT INTO musicas (titulo, artista) VALUES (?, ?)`,
    [titulo, artista],
    function (err) {
      if (err) {
        console.error('Erro ao adicionar música:', err.message);
        res.status(500).json({ erro: err.message });
      } else {
        console.log(`Música adicionada: ${titulo} - ${artista}`);
        res.json({ id: this.lastID, titulo, artista });
      }
    }
  );
});

app.put('/musicas/:id', (req, res) => {
  const { id } = req.params;
  const { titulo, artista } = req.body;

  db.run(
    `UPDATE musicas SET titulo = ?, artista = ? WHERE id = ?`,
    [titulo, artista, id],
    function (err) {
      if (err) {
        console.error('Erro ao atualizar música:', err.message);
        res.status(500).json({ erro: err.message });
      } else {
        res.json({ mensagem: 'Música atualizada com sucesso!' });
      }
    }
  );
});

app.delete('/musicas/:id', (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM musicas WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Erro ao remover música:', err.message);
      res.status(500).json({ erro: err.message });
    } else {
      res.json({ mensagem: 'Música removida com sucesso!' });
    }
  });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
