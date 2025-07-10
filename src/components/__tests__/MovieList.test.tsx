import React from 'react';
import { render } from '@testing-library/react-native';
import MovieList from '../MovieList';

const mockMovies = [
  { id: 1, title: 'Test Movie', poster_path: '/test.jpg' },
  { id: 2, title: 'Another Movie', poster_path: '/test2.jpg' },
];

describe('MovieList', () => {
  it('renders skeleton when loading', () => {
    const { getByTestId } = render(
      <MovieList title="Test" movies={[]} loading={true} />
    );
    // Skeleton is just a View, so check for existence
    expect(getByTestId('skeleton-row')).toBeTruthy();
  });

  it('renders movies when not loading', () => {
    const { getByText } = render(
      <MovieList title="Test" movies={mockMovies} loading={false} />
    );
    expect(getByText('Test Movie')).toBeTruthy();
    expect(getByText('Another Movie')).toBeTruthy();
  });
}); 