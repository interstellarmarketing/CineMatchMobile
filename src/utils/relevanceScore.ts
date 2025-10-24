import { TVShow } from '../types';

// Genre IDs that we want to exclude entirely (News, Talk-Show)
const BLOCK_GENRES = new Set<number>([
  10763, // News
  10767, // Talk-Show / Late-Night
]);

// Genres that are often popular but not always "relevant" to a top-tier list.
// We will penalize these rather than blocking them entirely.
const PENALTY_GENRES = new Set<number>([
  16,    // Animation
  10751, // Family
  10764, // Reality
  10766, // Soap
]);

// Title keywords that typically represent evergreen or low-relevance shows we want to demote
const BLOCK_KEYWORDS: RegExp[] = [
  /late\s?night/i,
  /tonight\s?show/i,
  /conan/i,
  /gre(y|ey)'?s?\s+anatomy/i,
  /^ncis/i,
  /csi/i,
];

// Penalise (or block) shows that first aired before this year.
// Note: If very old shows (e.g. Chespirito) are still appearing, it's likely
// due to an incorrect or missing `first_air_date` in TMDB's database for that entry.
const MIN_YEAR = 2000;

// ----------------------------
// Utility helpers
// ----------------------------

// Checks whether a TV show should be excluded from the final list
const isBlocked = (show: Partial<TVShow>): boolean => {
  // Hard-exclude by genre
  if (show.genre_ids && show.genre_ids.some((id) => BLOCK_GENRES.has(id))) {
    return true;
  }

  // Hard-exclude by title keywords
  const title = show.name || '';
  if (BLOCK_KEYWORDS.some((rx) => rx.test(title))) {
    return true;
  }

  // Penalise/Exclude very old content (< 2000)
  if (show.first_air_date) {
    const year = parseInt(show.first_air_date.slice(0, 4), 10);
    if (year && year < MIN_YEAR) {
      return true;
    }
  }

  return false;
};

// Applies penalties to a show's score based on certain criteria (e.g., genre)
const applyPenalties = (score: number, show: Partial<TVShow>): number => {
  let finalScore = score;
  // Apply a 40% penalty to shows in our penalty genres (Animation, Soap, etc.)
  if (show.genre_ids && show.genre_ids.some(id => PENALTY_GENRES.has(id))) {
    finalScore *= 0.6;
  }
  return finalScore;
};

// Compute a composite relevance score that blends popularity and quality metrics.
const computeScore = (show: Partial<TVShow>): number => {
  const popularity = show.popularity ?? 0;
  // Use log10 for a more balanced curve, heavily weight vote_average
  const ratingQuality = (show.vote_average ?? 0) * Math.log10((show.vote_count ?? 0) + 1);

  // 30% weight to raw popularity, 70% to our quality metric.
  const baseScore = popularity * 0.3 + ratingQuality * 0.7;
  
  return applyPenalties(baseScore, show);
};

/**
 * Applies filtering and scoring to a list of TV shows to prioritise relevant titles.
 * 1. Excludes unwanted genres & keywords.
 * 2. Removes titles first-aired before 2000.
 * 3. Ranks remaining shows by a composite popularity/quality score.
 */
export const refineTVShows = (shows: TVShow[]): TVShow[] => {
  return shows
    .filter((s) => !isBlocked(s))
    .map((s) => {
      const composite = computeScore(s);
      // Override popularity so downstream "popularity" sorts use our composite score
      return {
        ...s,
        raw_popularity: s.popularity, // keep original for reference/debug
        popularity: composite,
      } as TVShow & { raw_popularity?: number };
    })
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}; 