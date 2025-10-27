import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';

type MovieDetailsMini = {
  runtime?: number;
  overview?: string;
  vote_average?: number;
  release_date?: string;
};

type TVDetailsMini = {
  number_of_seasons?: number;
  overview?: string;
  vote_average?: number;
  first_air_date?: string;
};

export const useTitleMiniDetails = (
  mediaType: 'movie' | 'tv',
  mediaId: number,
  enabled: boolean = true
) => {
  const { data } = useQuery<MovieDetailsMini | TVDetailsMini>({
    queryKey: ['miniDetails', mediaType, mediaId],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/${mediaType}/${mediaId}`, API_OPTIONS);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    enabled: enabled && !!mediaId,
    staleTime: 1000 * 60 * 60 * 24, // 24h cache
  });

  const runtimeMinutes = (data as MovieDetailsMini)?.runtime || undefined;
  const seasons = (data as TVDetailsMini)?.number_of_seasons || undefined;
  const overview = (data as MovieDetailsMini)?.overview || (data as TVDetailsMini)?.overview || undefined;
  const voteAverage = (data as MovieDetailsMini)?.vote_average ?? (data as TVDetailsMini)?.vote_average;
  const releaseDate = (data as MovieDetailsMini)?.release_date || (data as TVDetailsMini)?.first_air_date || '';
  const year = (releaseDate || '').slice(0, 4);

  return { runtimeMinutes, seasons, overview, voteAverage, year, releaseDate };
};


