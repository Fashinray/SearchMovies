import React, { useEffect, useState } from "react";
import Search from "../public/components/search";
import Spinner from "../public/components/spinner";
import MovieCard from "../public/components/MovieCard";
import { useDebounce } from 'react-use'
import { getTrendingMovies, updateSearchCount } from "../appwrite";

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ODYyMWE2NjM4ZTRmOWZmN2Q0NTFjNjRlZmZhMTYzZiIsIm5iZiI6MS43NDczMDk1NTE2NTc5OTk4ZSs5LCJzdWIiOiI2ODI1ZDNlZjRhZmZmMGFmYTcyZDJhNjciLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.fDqxrNMlpy0yoiqRI_ZxQHDQ9tgCw4Z6WjHud3LYY1k'
  }
};

fetch('https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));


const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  


  // Debounce the search term to prevent making too many API requests
  // by waiting for the users t stop typing for 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;

      const response = await fetch(endpoint, options);

      const loadTrendingmovies = async () => {
        try {
          const movies = await getTrendingMovies();

          setTrendingMovies(movies);
        } catch (error) {
          console.error(`Error fetching trending movies: ${error}`);
        }

          useEffect(() => {
          loadTrendingmovies();
         }, []);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      
      if(data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error) {
      //console.error(`Error Fetching Movies: ${error}`);
      setErrorMessage('Error Fetching Movies. Please try again later.');
    } finally {
      setIsLoading(false); // 
    }
  }; 

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);



  return (
    <main className="min-h-screen bg-gradient-to-br from-[#090e22] to-[#090a19]">
      <div className="pattern" />

      <div className="wrapper flex flex-col justify-center items-center min-h-screen px-4">
        <header>
          <img src="./h4.png" alt="Hero Banner" className="min-h-40 my-6" />
          <h1 className="text-4xl font-bold text-center text-white">
            Find <span className="bg-linear-to-r from-[#D6C7FF] to-[#ABBBFF] bg-clip-text text-transparent">Movies</span> You'll Love <br /> Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
          <h1 className="text-white">{searchTerm}</h1>
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movies, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies w-full px-6 md:px-16 lg:px-32 " >
          <h2 className="text-white mt-[2grid-cols-20px] text-2xl font-semibold mb-6">All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <p className=" ">
            <ul className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 border border-gray-700 rounded-2xl text-white bg-[#0f0d23]  shadow-lg overflow-hidden">
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
            </p>
          )}
        </section>
      </div>
    </main>
  ); //mb-2    
};

export default App;
