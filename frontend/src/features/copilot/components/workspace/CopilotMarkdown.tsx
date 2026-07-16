import { Text } from '@mantine/core';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';

interface CopilotMarkdownProps {
  content: string;
  muted?: boolean;
}

const components: Components = {
  p: ({ children }) => (
    <Text size="sm" mb={6} style={{ lineHeight: 1.55 }}>
      {children}
    </Text>
  ),
  strong: ({ children }) => (
    <Text span inherit fw={650}>
      {children}
    </Text>
  ),
  em: ({ children }) => (
    <Text span inherit fs="italic">
      {children}
    </Text>
  ),
  ul: ({ children }) => <ul className="copilot-md-list">{children}</ul>,
  ol: ({ children }) => <ol className="copilot-md-list">{children}</ol>,
  li: ({ children }) => (
    <li className="copilot-md-li">
      <Text size="sm" component="span" style={{ lineHeight: 1.55 }}>
        {children}
      </Text>
    </li>
  ),
  code: ({ children }) => <code className="copilot-md-code">{children}</code>,
  h1: ({ children }) => (
    <Text size="sm" fw={700} mb={6}>
      {children}
    </Text>
  ),
  h2: ({ children }) => (
    <Text size="sm" fw={700} mb={6}>
      {children}
    </Text>
  ),
  h3: ({ children }) => (
    <Text size="sm" fw={650} mb={4}>
      {children}
    </Text>
  ),
};

export function CopilotMarkdown({ content, muted }: CopilotMarkdownProps) {
  return (
    <div className={muted ? 'copilot-md is-muted' : 'copilot-md'}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
