const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) console.error("Erro ao conectar ao banco de dados SQLite:", err);
    console.log("Conectado ao banco de dados SQLite!")
});

db.run(`
    CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cost REAL NOT NULL,
    limit_date TEXT NOT NULL,
    position INTEGER NOT NULL
    );
`);

app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY position', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/tasks', (req, res) => {
    const { name, cost, limit_date } = req.body;

    db.get('SELECT MAX(position) as maxPos FROM tasks', [], (err, row) => {
        const newPosition = (row.maxPos || 0) + 1;

        db.run(
            'INSERT INTO tasks (name, cost, limit_date, position) VALUES (?, ?, ?, ?)',
            [name, cost, limit_date, newPosition],
            function (err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ id: this.lastID, name, cost, limit_date, position: newPosition });
            }
        );
    });
});

app.put('/tasks/:id', (req, res) => {
    const { name, cost, limit_date } = req.body;

    db.run(
        'UPDATE tasks SET name = ?, cost = ?, limit_date = ? WHERE id = ?',
        [name, cost, limit_date, req.params.id],
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: req.params.id, name, cost, limit_date });
        }
    );
});

app.delete('/tasks/:id', (req, res) => {
    db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Tarefa deletada com sucesso!' });
    });
});

app.put('/tasks/reorder', (req, res) => {
    const { tasks } = req.body;

    const updatePromises = tasks.map((task, index) => {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE tasks SET position = ? WHERE id = ?',
                [index, task.id],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    });

    Promise.all(updatePromises)
    .then(() => res.json({ message: 'Ordem atualizada com sucesso!' }))
    .catch(err => res.status(500).json({ error: err.message }));
});

const PORT = 3333;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}!`);
});