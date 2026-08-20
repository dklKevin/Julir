import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { useLocalStorage, useLocalStorageString } from '../hooks/useLocalStorage';

function StorageProbe() {
  const [value, setValue, removeValue] = useLocalStorage('probe-key', 'init');
  return (
    <div>
      <span data-testid="value">{value}</span>
      <button type="button" onClick={() => setValue('next')}>
        set
      </button>
      <button type="button" onClick={() => setValue((prev) => `${prev}!`)}>
        update
      </button>
      <button type="button" onClick={removeValue}>
        remove
      </button>
    </div>
  );
}

function StringProbe() {
  const [value, setValue] = useLocalStorageString('string-key', 'hello');
  return (
    <div>
      <span data-testid="string-value">{value}</span>
      <button type="button" onClick={() => setValue('world')}>
        change
      </button>
    </div>
  );
}

describe('useLocalStorage', () => {
  it('reads an existing value and updates it', () => {
    localStorage.setItem('probe-key', JSON.stringify('saved'));
    render(<StorageProbe />);
    expect(screen.getByTestId('value')).toHaveTextContent('saved');

    fireEvent.click(screen.getByText('set'));
    expect(screen.getByTestId('value')).toHaveTextContent('next');
    expect(localStorage.getItem('probe-key')).toBe(JSON.stringify('next'));

    fireEvent.click(screen.getByText('update'));
    expect(screen.getByTestId('value')).toHaveTextContent('next!');

    fireEvent.click(screen.getByText('remove'));
    expect(screen.getByTestId('value')).toHaveTextContent('init');
    expect(localStorage.getItem('probe-key')).toBeNull();
  });

  it('falls back when stored JSON is invalid', () => {
    localStorage.setItem('probe-key', 'not-json');
    render(<StorageProbe />);
    expect(screen.getByTestId('value')).toHaveTextContent('init');
  });

  it('syncs from other-tab storage events', () => {
    render(<StorageProbe />);
    fireEvent(
      window,
      new StorageEvent('storage', {
        key: 'probe-key',
        newValue: JSON.stringify('from-other-tab'),
      })
    );
    expect(screen.getByTestId('value')).toHaveTextContent('from-other-tab');
  });

  it('exposes a string helper', () => {
    render(<StringProbe />);
    expect(screen.getByTestId('string-value')).toHaveTextContent('hello');
    fireEvent.click(screen.getByText('change'));
    expect(screen.getByTestId('string-value')).toHaveTextContent('world');
  });
});
