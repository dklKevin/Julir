/**
 * Onboarding tour timing on first launch: the tour must wait for the
 * profile setup modal and start 1.5 s after it closes.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import JulirApp from '../App';

const TOUR_DELAY_MS = 1500;

const queryTour = () => screen.queryByRole('button', { name: /close onboarding/i });

describe('OnboardingTooltip on first launch', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show the tour while the name box is open', () => {
    render(<JulirApp />);
    expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(TOUR_DELAY_MS * 4);
    });

    expect(queryTour()).not.toBeInTheDocument();
    expect(localStorage.getItem('julir-onboarding-completed')).toBeNull();
  });

  it('shows the tour 1.5 s after the name is saved', () => {
    render(<JulirApp />);
    act(() => {
      vi.advanceTimersByTime(TOUR_DELAY_MS * 2);
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your name/i), {
      target: { value: 'John' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.queryByPlaceholderText(/enter your name/i)).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(TOUR_DELAY_MS - 1);
    });
    expect(queryTour()).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(queryTour()).toBeInTheDocument();
    expect(screen.getByText('Welcome to Julir!')).toBeInTheDocument();
  });

  it('shows the tour 1.5 s after the name box is skipped', () => {
    render(<JulirApp />);
    act(() => {
      vi.advanceTimersByTime(TOUR_DELAY_MS * 2);
    });

    fireEvent.click(screen.getByRole('button', { name: /skip for now/i }));

    act(() => {
      vi.advanceTimersByTime(TOUR_DELAY_MS - 1);
    });
    expect(queryTour()).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(queryTour()).toBeInTheDocument();
  });
});
