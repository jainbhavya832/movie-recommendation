import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Ensure to import your CSS

function App() {
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [movieTitle, setMovieTitle] = useState('');
    const [movieGenre, setMovieGenre] = useState('');
    const [movieRating, setMovieRating] = useState('');
    const [recommendedMovies, setRecommendedMovies] = useState([]);
    const [inputMovie, setInputMovie] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [movieTitles, setMovieTitles] = useState([]);
    const [activeTab, setActiveTab] = useState('tracker'); // State for toggling tabs

    useEffect(() => {
        fetchUsers();
        fetchMovieTitles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMovieTitles = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/movies');
            setMovieTitles(response.data);
        } catch (error) {
            console.error('Error fetching movie titles:', error);
        }
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

    const getRecommendations = async (movieName) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/recommend?movie=${movieName}`);
            setRecommendedMovies(response.data);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        }
    };

    const handleMovieInputChange = (e) => {
        const value = e.target.value;
        setInputMovie(value);
        if (value) {
            const filteredSuggestions = movieTitles.filter(movie =>
                movie.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (movie) => {
        setInputMovie(movie);
        setSuggestions([]);
    };

    const renderMovieTracker = () => (
        <div>
            <h2>Create User</h2>
            <form onSubmit={createUser} className="user-form">
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    required
                />
                <button type="submit">Create</button>
            </form>

            <h2>Users</h2>
            <ul className="user-list">
                {users.map((user) => (
                    <li key={user._id} className="user-item">
                        <div className="user-header">
                            <span onClick={() => setSelectedUser(user)} className="user-name">
                                {user.username} - Movies: {user.movies.length}
                            </span>
                            <button onClick={() => deleteUser(user._id)} className="delete-user">Delete User</button>
                        </div>
                        {selectedUser === user && (
                            <>
                                <ul className="movie-list">
                                    {user.movies.map((movie, index) => (
                                        <li key={index} className="movie-item">
                                            <div className="movie-card">
                                                <h4>{movie.title}</h4>
                                                <p>{movie.genre}</p>
                                                <p>Rating: {movie.rating}</p>
                                                <button onClick={() => deleteMovie(index)} className="delete-movie">Delete</button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>

                                <h3>Add Movie</h3>
                                <input
                                    value={movieTitle}
                                    onChange={(e) => setMovieTitle(e.target.value)}
                                    placeholder="Movie Title"
                                    required
                                />
                                <input
                                    value={movieGenre}
                                    onChange={(e) => setMovieGenre(e.target.value)}
                                    placeholder="Genre"
                                    required
                                />
                                <input
                                    value={movieRating}
                                    onChange={(e) => setMovieRating(e.target.value)}
                                    placeholder="Rating"
                                    required
                                    type="number"
                                />
                                <button onClick={addMovie}>Add Movie</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );

    const renderMovieRecommendations = () => (
        <div>
            <h3>Get Recommendations</h3>
            <input
                value={inputMovie}
                onChange={handleMovieInputChange}
                placeholder="Enter Movie Name"
            />
            <button onClick={() => getRecommendations(inputMovie)}>Get Recommendations</button>

            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((movie, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(movie)} className="suggestion-item">
                            {movie}
                        </li>
                    ))}
                </ul>
            )}

            <h4>Recommendations:</h4>
            <ul className="recommended-movies">
                {recommendedMovies.map((movie, index) => (
                    <li key={index} className="recommendation-item">
                        <div className="movie-card">
                            <img src={movie.poster_url} alt={movie.title} className="movie-poster" />
                            <h5>{movie.title}</h5>
                            <p>{movie.genre}</p>
                            <p>Rating: {movie.rating}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="app-container">
            <nav className="navbar">
                <button className={`nav-button ${activeTab === 'tracker' ? 'active' : ''}`} onClick={() => setActiveTab('tracker')}>Movie Tracker</button>
                <button className={`nav-button ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>Movie Recommendations</button>
            </nav>

            {activeTab === 'tracker' ? renderMovieTracker() : renderMovieRecommendations()}
        </div>
    );
}

export default App;
