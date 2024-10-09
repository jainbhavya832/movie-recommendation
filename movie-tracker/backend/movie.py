import numpy as np
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns
import warnings
warnings.filterwarnings("ignore")
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
from copy import deepcopy
import plotly.express as px
import torch
# from torchtext.data.utils import get_tokenizer
# from torchtext.vocab import build_vocab_from_iterator
from torch.utils.data import Dataset, DataLoader
import torch.nn as nn

df = pd.read_csv('imdb-movies-dataset.csv')


df = df.drop(['Metascore', 'Review', 'Review Count', 'Votes'], axis=1)

df = df.dropna()
finaldf=df.copy()

from textblob import TextBlob
def review_sentiment(review):
    analysis = TextBlob(review)
    polarity = analysis.sentiment.polarity
    if polarity >= 0.1:
        return 'positive'
    elif polarity <= -0.1:
        return 'negative'
    else:
        return 'neutral'


df['Review Title'] = df['Review Title'].fillna('')
df['Review Title'] = df['Review Title'].astype(str)
df['Review Title'] = df['Review Title'].str.lower()
df['Review Sentiment'] = df['Review Title'].apply(review_sentiment)

df['Description'] = df['Description'].fillna('')
df['Description'] = df['Description'].astype(str)
df['Description'] = df['Description'].str.lower()
df['Description Sentiment'] = df['Description'].apply(review_sentiment)

def sorting_the_attribute(row , attribute):

    text_list = getattr(row , attribute).split(', ')

    # text_list = row.Genre.split(', ')
    text_list.sort()
    return ', '.join(text_list)


df.Cast = df.apply(lambda row: sorting_the_attribute(row , 'Cast'), axis=1)
df.Genre = df.apply(lambda row : sorting_the_attribute(row , 'Genre'), axis=1)

df["movie_describe"] = "Certificate: " + df["Certificate"] + ". Year: " + df["Year"].astype(str) + ". Duration: " + df["Duration (min)"].astype(str) + ". Genre: " + df["Genre"] + ". Cast: " + df["Cast"] + ". Director: " + df["Director"] + ". Description Sentiment: " + df["Description Sentiment"] + ". Review Sentiment: " + df["Review Sentiment"] + "."

required_df = df[["Title", "movie_describe", "Poster", "Rating", "Genre"]].copy()

required_df["Title"] = required_df["Title"].str.lower()
required_df["movie_describe"] = required_df["movie_describe"].str.lower()

cv = CountVectorizer(max_features=5000, stop_words='english')
vector = cv.fit_transform(required_df["movie_describe"]).toarray()

similarity = cosine_similarity(vector)

required_df.reset_index(inplace=True)
required_df.drop("index", axis=1, inplace=True)

def titles():
    return df["Title"].tolist()

def similar_movie(name):
    name = name.lower()
    indices = required_df[required_df["Title"] == name].index[0]
    distances = similarity[indices]
    arr = sorted(list(enumerate(distances)), reverse = True, key=lambda x: x[1])[1:9]
    # print(arr)

    # print("Similar movies:")
    # print()
    recommendation=[]
    # row = 1
    for j, i in enumerate(arr):
        print("Recommended movie number {}: ".format(j+1))
        title = required_df.loc[i[0], "Title"]
        desc = required_df.loc[i[0], "movie_describe"]
        poster=required_df.loc[i[0], "Poster"]
        rating=required_df.loc[i[0], "Rating"]
        genre=required_df.loc[i[0], "Genre"]
        print(title.capitalize())
        print(poster)
        print("\n")
        recommendation.append({"title": title, "poster_url":poster, "rating":rating, "genre":genre})
        # row += 1
    return recommendation

# print("Movies similar to '{}'".format(df.iloc[222,1]))
# similar_movie(df.iloc[222, 1])

# similar_movie("Avengers: Endgame")