import type { Preview } from '@storybook/nextjs-vite';
import type { ReactRenderer } from '@storybook/react';
import ThemeRegistry from '../src/components/ThemeRegistry';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <ThemeRegistry>
        <Story />
      </ThemeRegistry>
    ),
  ],
};

export default preview;
