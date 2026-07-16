import { MantineProvider } from '@mantine/core';
import type { Preview } from '@storybook/react';
import '@mantine/core/styles.css';

import { copilotTheme } from '../src/design/mantine-theme';
import '../src/design/tokens.css';
import '../src/index.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider theme={copilotTheme} defaultColorScheme="dark">
        <div style={{ padding: 24 }}>
          <Story />
        </div>
      </MantineProvider>
    ),
  ],
};

export default preview;
