import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('redirects to dashboard content', async () => {
  render(<App />);
  expect(await screen.findByText(/Chào mừng trở lại/i)).toBeInTheDocument();
});
