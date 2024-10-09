from flask import Flask, request, jsonify
from movie import similar_movie  # Adjust the import based on your code
from movie import titles
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# app = Flask(__name__)

@app.route('/recommend', methods=['GET'])
def recommend():
    movie_name = request.args.get('movie')
    if not movie_name:
        return jsonify({'error': 'Movie name is required'}), 400
    recommendations = similar_movie(movie_name)  # Call your recommendation function
    return jsonify(recommendations)

@app.route('/movies', methods=['GET'])
def get_movies():
    # Load movie titles from CSV  # Assuming 'title' is the column name
    return jsonify(titles())

if __name__ == '__main__':
    app.run(debug=True)
