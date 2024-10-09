// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// User and Movie Models
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    movies: [{ title: String, year: Number }]
});

const User = mongoose.model('User', userSchema);

// API Routes
app.post('/api/users', async (req, res) => {
    const { username } = req.body;
    try {
        const newUser = new User({ username });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/users/:userId/movies', async (req, res) => {
    const { userId } = req.params;
    const { title, year } = req.body;
    try {
        const user = await User.findById(userId);
        user.movies.push({ title, year });
        await user.save();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// Delete a user
app.delete('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndDelete(userId);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a movie
app.delete('/api/users/:userId/movies/:movieIndex', async (req, res) => {
    const { userId, movieIndex } = req.params;
    try {
        const user = await User.findById(userId);
        user.movies.splice(movieIndex, 1);
        await user.save();
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
