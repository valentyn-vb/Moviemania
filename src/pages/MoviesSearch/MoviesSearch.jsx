import { useSearchParams, useNavigate, useLocaion } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import Searchbar from 'components/Searchbar';
import { fetchMovieByQuery } from 'Services/api';
import Loader from 'components/Reusable Components/Loader';
import useMovies from 'Hooks/useMovies';
import { List } from 'components/MovieCard/MovieCard.styled';
import MovieCard from 'components/MovieCard';
import { Box } from 'components/Reusable Components/Box';
import BackToTopLink from 'components/Reusable Components/BackToTopLink';
import { intObserverManager } from 'Services/infiniteScroll';

function MoviesSearch() {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const searchQuery = searchParams.get('query') ?? '';

  const { isLoading, results, hasNextPage, error, config } = useMovies(
    page,
    fetchMovieByQuery,
    searchQuery
  );

  const handleFormSubmit = query => {
    navigate({
      pathname: '/movies',
      search: `?query=${query}`,
    });
    setPage(1);
  };

  const addPage = () => {
    setPage(prev => prev + 1);
  };
  const intObserver = useRef();
  const firstElRef = useRef();

  const lastMovieRef = useCallback(
    movieCard => {
      const params = {
        movieCard,
        hasNextPage,
        isLoading,
        addPage,
        intObserver,
      };
      intObserverManager(params);
    },
    [isLoading, hasNextPage]
  );

  const content = results.map((movie, i) => {
    if (results.length === i + 1) {
      return (
        <MovieCard
          ref={lastMovieRef}
          key={movie.id}
          movie={movie}
          config={config}
        ></MovieCard>
      );
    }
    if (i === 1) {
      return (
        <MovieCard
          ref={firstElRef}
          key={movie.id}
          movie={movie}
          config={config}
        ></MovieCard>
      );
    }
    return <MovieCard key={movie.id} movie={movie} config={config}></MovieCard>;
  });

  return (
    <>
      <Searchbar onSubmit={handleFormSubmit}></Searchbar>
      {error && (
        <Box p="16px" color="white">
          Whoops, something went wrong: {error.message}
        </Box>
      )}
      {results.length > 0 && (
        <>
          <List>{content}</List>
          <BackToTopLink firstElRef={firstElRef}></BackToTopLink>
        </>
      )}
      {results.length === 0 && searchQuery && (
        <Box p="16px" color="white">
          Sorry, no movie found for this search query :(
        </Box>
      )}
      {isLoading && <Loader></Loader>}
    </>
  );
}

export default MoviesSearch;
