import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [movieTitle, setMovieTitle] = useState('');
    const [movieGenre, setMovieGenre] = useState('');
    const [movieRating, setMovieRating] = useState('');
    const [recommendedMovies, setRecommendedMovies] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
    };

    const createUser = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/users', { username });
        setUsername('');
        fetchUsers();
    };

    const addMovie = async () => {
        if (!selectedUser) return;
        await axios.post(`http://localhost:5000/api/users/${selectedUser._id}/movies`, {
            title: movieTitle,
            genre: movieGenre,
            rating: movieRating
        });
        setMovieTitle('');
        setMovieGenre('');
        setMovieRating('');
        fetchUsers();
    };

    const deleteUser = async (userId) => {
        await axios.delete(`http://localhost:5000/api/users/${userId}`);
        fetchUsers();
        if (selectedUser && selectedUser._id === userId) {
            setSelectedUser(null);
        }
    };

    const deleteMovie = async (movieIndex) => {
        if (!selectedUser) return;
        await axios.delete(`http://localhost:5000/api/users/${selectedUser._id}/movies/${movieIndex}`);
        fetchUsers();
    };

    const getRecommendations = async (genre) => {
        const response = await axios.get(`http://localhost:5000/api/recommendations/${genre}`);
        setRecommendedMovies(response.data);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ color: '#333' }}>Movie Recommendation System</h1>

            <h2>Create User</h2>
            <form onSubmit={createUser} style={{ marginBottom: '20px' }}>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                    style={{ padding: '10px', marginRight: '10px' }}
                />
                <button type="submit" style={{ padding: '10px 20px' }}>Create</button>
            </form>

            <h2>Users</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {users.map((user) => (
                    <li key={user._id} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span onClick={() => setSelectedUser(user)} style={{ cursor: 'pointer', color: '#007BFF' }}>
                                {user.username} - Movies: {user.movies.length}
                            </span>
                            <button onClick={() => deleteUser(user._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '5px' }}>Delete User</button>
                        </div>
                        {selectedUser === user && (
                            <>
                                <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                                    {user.movies.map((movie, index) => (
                                        <li key={index} style={{ marginBottom: '5px' }}>
                                            {movie.title} ({movie.genre}, Rating: {movie.rating}) 
                                            <button onClick={() => deleteMovie(index)} style={{ background: 'red', color: 'white', border: 'none', marginLeft: '10px', padding: '2px 5px' }}>Delete</button>
                                        </li>
                                    ))}
                                </ul>

                                <h3>Add Movie</h3>
                                <input
                                    value={movieTitle}
                                    onChange={(e) => setMovieTitle(e.target.value)}
                                    placeholder="Movie Title"
                                    required
                                    style={{ padding: '10px', marginRight: '10px' }}
                                />
                                <input
                                    value={movieGenre}
                                    onChange={(e) => setMovieGenre(e.target.value)}
                                    placeholder="Genre"
                                    required
                                    style={{ padding: '10px', marginRight: '10px' }}
                                />
                                <input
                                    value={movieRating}
                                    onChange={(e) => setMovieRating(e.target.value)}
                                    placeholder="Rating"
                                    required
                                    type="number"
                                    style={{ padding: '10px', marginRight: '10px' }}
                                />
                                <button onClick={addMovie} style={{ padding: '10px 20px' }}>Add Movie</button>

                                <h3>Get Recommendations</h3>
                                <input
                                    placeholder="Enter Genre"
                                    onChange={(e) => getRecommendations(e.target.value)}
                                    style={{ padding: '10px', marginRight: '10px' }}
                                />
                                <h4>Recommendations:</h4>
                                <ul>
                                    {recommendedMovies.map((movie, index) => (
                                        <li key={index}>{movie.title} ({movie.genre}, Rating: {movie.rating})</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
