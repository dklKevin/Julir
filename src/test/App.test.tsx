/**
 * Comprehensive tests for the Julir diary companion app.
 * Tests cover user profile, session management, chat interface,
 * character selection, and diary generation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JulirApp from '../App';

describe('JulirApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ===========================================================================
  // USER PROFILE TESTS
  // ===========================================================================

  describe('User Profile', () => {
    it('shows profile setup modal on first visit', () => {
      render(<JulirApp />);
      expect(screen.getByText(/welcome to julir/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your name/i)).toBeInTheDocument();
    });

    it('allows user to enter their name', async () => {
      render(<JulirApp />);

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      await userEvent.type(nameInput, 'John');

      expect(nameInput).toHaveValue('John');
    });

    it('saves profile and closes modal on continue', async () => {
      render(<JulirApp />);

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      await userEvent.type(nameInput, 'John');

      const continueButton = screen.getByRole('button', { name: /continue/i });
      await userEvent.click(continueButton);

      await waitFor(() => {
        expect(screen.queryByText(/welcome to julir/i)).not.toBeInTheDocument();
      });
    });

    it('allows skipping profile setup', async () => {
      render(<JulirApp />);

      const skipButton = screen.getByRole('button', { name: /skip for now/i });
      await userEvent.click(skipButton);

      await waitFor(() => {
        expect(screen.queryByText(/welcome to julir/i)).not.toBeInTheDocument();
      });
    });

    it('displays user name in header after setup', async () => {
      render(<JulirApp />);

      const nameInput = screen.getByPlaceholderText(/enter your name/i);
      await userEvent.type(nameInput, 'John');
      await userEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByText(/hi, john/i)).toBeInTheDocument();
      });
    });

    it('persists user name in localStorage', async () => {
      render(<JulirApp />);

      await userEvent.type(screen.getByPlaceholderText(/enter your name/i), 'John');
      await userEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        const stored = localStorage.getItem('julir_user_profile');
        expect(stored).toContain('John');
      });
    });
  });

  // ===========================================================================
  // START SCREEN TESTS
  // ===========================================================================

  describe('Start Screen', () => {
    beforeEach(async () => {
      // Skip profile setup for these tests
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    });

    it('displays character name and emoji', async () => {
      await waitFor(() => {
        const titles = screen.getAllByText('Julir');
        expect(titles.length).toBeGreaterThan(0);
      });
    });

    it('displays three character keywords', async () => {
      await waitFor(() => {
        expect(screen.getByText('Gentle')).toBeInTheDocument();
        expect(screen.getByText('Warm')).toBeInTheDocument();
        expect(screen.getByText('Playful')).toBeInTheDocument();
      });
    });

    it('displays start writing button', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start writing/i })).toBeInTheDocument();
      });
    });

    it('displays change companion button', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /change companion/i })).toBeInTheDocument();
      });
    });

    it('displays current date', async () => {
      const today = new Date();
      const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });

      await waitFor(() => {
        expect(screen.getByText(new RegExp(dayName, 'i'))).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // SESSION MANAGEMENT TESTS
  // ===========================================================================

  describe('Session Management', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    });

    it('starts session when clicking start button', async () => {
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      await waitFor(() => {
        expect(screen.getByText(/Hey, I'm Julir/i)).toBeInTheDocument();
      });
    });

    it('hides start screen after starting session', async () => {
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /start writing/i })).not.toBeInTheDocument();
      });
    });

    it('shows chat controls after starting', async () => {
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });
    });

    it('shows finish button after starting', async () => {
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // HEADER CONTROLS TESTS
  // ===========================================================================

  describe('Header Controls', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    });

    it('renders all header buttons', async () => {
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThanOrEqual(6);
      });
    });

    it('toggles theme when clicking theme button', async () => {
      const container = document.querySelector('.min-h-screen');

      // Find and click theme toggle (second header button)
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[1]);

      await waitFor(() => {
        expect(container?.className).toContain('bg-stone-950');
      });
    });

    it('opens settings panel when clicking settings', async () => {
      const buttons = screen.getAllByRole('button');
      const settingsButton = buttons[4];

      await userEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText(/your name/i)).toBeInTheDocument();
        expect(screen.getByText(/gemini api key/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // SETTINGS TESTS
  // ===========================================================================

  describe('Settings Panel', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));

      // Open settings
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[4]);
    });

    it('shows name input in settings', async () => {
      await waitFor(() => {
        expect(screen.getByText(/your name/i)).toBeInTheDocument();
      });
    });

    it('shows Gemini API key input', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/for ai conversations/i)).toBeInTheDocument();
      });
    });

    it('shows Google TTS API key input', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/for natural voice/i)).toBeInTheDocument();
      });
    });

    it('allows entering API keys', async () => {
      const geminiInput = screen.getByPlaceholderText(/for ai conversations/i);
      await userEvent.type(geminiInput, 'test-api-key');

      expect(geminiInput).toHaveValue('test-api-key');
    });
  });

  // ===========================================================================
  // CHARACTER SELECTION TESTS
  // ===========================================================================

  describe('Character Selection', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
    });

    it('opens character selection modal', async () => {
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[3]); // Character select button

      await waitFor(() => {
        expect(screen.getByText(/choose companion/i)).toBeInTheDocument();
      });
    });

    it('shows all four characters', async () => {
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[3]);

      await waitFor(() => {
        expect(screen.getAllByText('Julir').length).toBeGreaterThan(0);
        expect(screen.getByText('Solomon')).toBeInTheDocument();
        expect(screen.getByText('Eli')).toBeInTheDocument();
        expect(screen.getByText('Jennifer')).toBeInTheDocument();
      });
    });

    it('shows character keywords', async () => {
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[3]);

      await waitFor(() => {
        expect(screen.getByText('Steady')).toBeInTheDocument();
        expect(screen.getByText('Energetic')).toBeInTheDocument();
        expect(screen.getByText('Direct')).toBeInTheDocument();
      });
    });

    it('can select different character', async () => {
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[3]);

      await waitFor(() => {
        expect(screen.getByText('Solomon')).toBeInTheDocument();
      });

      const solomonButton = screen.getByText('Solomon').closest('button');
      if (solomonButton) {
        await userEvent.click(solomonButton);
      }

      // Start session with Solomon
      const beginButton = screen.getByText(/begin with solomon/i);
      await userEvent.click(beginButton);

      await waitFor(() => {
        expect(screen.getByText(/I'm Solomon/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // CHAT INTERFACE TESTS
  // ===========================================================================

  describe('Chat Interface', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));
    });

    it('displays greeting message', async () => {
      await waitFor(() => {
        expect(screen.getByText(/Hey, I'm Julir/i)).toBeInTheDocument();
      });
    });

    it('allows typing in input', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Hello Julir');

      expect(input).toHaveValue('Hello Julir');
    });

    it('sends message on form submit', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Test message');

      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Test message')).toBeInTheDocument();
      });
    });

    it('clears input after sending', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Test message');

      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(input).toHaveValue('');
      }, { timeout: 3000 });
    });

    it('displays user messages on right side', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'My message');

      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        const userMessage = screen.getByText('My message');
        const container = userMessage.closest('div[class*="justify-end"]');
        expect(container).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('displays assistant messages on left side', async () => {
      await waitFor(() => {
        const greeting = screen.getByText(/Hey, I'm Julir/i);
        const container = greeting.closest('div[class*="justify-start"]');
        expect(container).toBeInTheDocument();
      });
    });
  });

  // ===========================================================================
  // NAME CORRECTION TESTS
  // ===========================================================================

  describe('Name Correction', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));
    });

    it('corrects Julia to Julir', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Hi Julia');

      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Hi Julir/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  // ===========================================================================
  // DIARY GENERATION TESTS
  // ===========================================================================

  describe('Diary Entry Generation', () => {
    beforeEach(async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));
    });

    it('shows diary modal after finish with messages', async () => {
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      // Send a message first
      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Test diary entry');
      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Test diary entry')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Click finish
      await userEvent.click(screen.getByRole('button', { name: /finish/i }));

      await waitFor(() => {
        expect(screen.getByText(/your entry/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('does not show diary modal without user messages', async () => {
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /finish/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /finish/i }));

      // Wait and verify no modal
      await new Promise((r) => setTimeout(r, 500));
      expect(screen.queryByText(/your entry/i)).not.toBeInTheDocument();
    });
  });

  // ===========================================================================
  // LOCALSTORAGE TESTS
  // ===========================================================================

  describe('LocalStorage Integration', () => {
    it('saves diary entries to localStorage', async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Test entry');
      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Test entry')).toBeInTheDocument();
      }, { timeout: 3000 });

      await userEvent.click(screen.getByRole('button', { name: /finish/i }));

      await waitFor(() => {
        expect(screen.getByText(/your entry/i)).toBeInTheDocument();
      }, { timeout: 3000 });

      await userEvent.click(screen.getByRole('button', { name: /save entry/i }));

      await waitFor(() => {
        expect(screen.queryByText(/your entry/i)).not.toBeInTheDocument();
      }, { timeout: 2000 });

      const saved = localStorage.getItem('julir_entries');
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!).length).toBeGreaterThan(0);
    });

    it('handles corrupted localStorage gracefully', () => {
      localStorage.setItem('julir_entries', 'invalid json');
      expect(() => render(<JulirApp />)).not.toThrow();
    });

    it('persists character selection', async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));

      // Open character select and choose Solomon
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[3]);

      await waitFor(() => {
        expect(screen.getByText('Solomon')).toBeInTheDocument();
      });

      const solomonButton = screen.getByText('Solomon').closest('button');
      if (solomonButton) await userEvent.click(solomonButton);

      // Check localStorage
      await waitFor(() => {
        const saved = localStorage.getItem('julir_character');
        expect(saved).toContain('solomon');
      });
    });

    it('persists theme preference', async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));

      // Toggle theme
      const buttons = screen.getAllByRole('button');
      await userEvent.click(buttons[1]);

      await waitFor(() => {
        const saved = localStorage.getItem('julir_theme');
        expect(saved).toContain('dark');
      });
    });
  });

  // ===========================================================================
  // DEMO MODE TESTS
  // ===========================================================================

  describe('Demo Mode', () => {
    it('returns demo responses without API key', async () => {
      render(<JulirApp />);
      await userEvent.click(screen.getByRole('button', { name: /skip for now/i }));
      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your thoughts/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/type your thoughts/i);
      await userEvent.type(input, 'Hello');
      const form = input.closest('form');
      if (form) fireEvent.submit(form);

      // Should get a response even without API key
      await waitFor(() => {
        const messages = document.querySelectorAll('.leading-relaxed');
        expect(messages.length).toBeGreaterThan(1);
      }, { timeout: 3000 });
    });
  });

  // ===========================================================================
  // PERSONALIZATION TESTS
  // ===========================================================================

  describe('Personalization', () => {
    it('personalizes greeting with user name', async () => {
      render(<JulirApp />);

      // Enter name
      await userEvent.type(screen.getByPlaceholderText(/enter your name/i), 'John');
      await userEvent.click(screen.getByRole('button', { name: /continue/i }));

      // Start session
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /start writing/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /start writing/i }));

      // Greeting should include name
      await waitFor(() => {
        expect(screen.getByText(/john, tell me/i)).toBeInTheDocument();
      });
    });

    it('shows personalized message on start screen', async () => {
      render(<JulirApp />);

      await userEvent.type(screen.getByPlaceholderText(/enter your name/i), 'John');
      await userEvent.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(screen.getByText(/ready to listen, john/i)).toBeInTheDocument();
      });
    });
  });
});
