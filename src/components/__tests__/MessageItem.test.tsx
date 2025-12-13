import { render, screen, fireEvent } from '@testing-library/react';
import { MessageItem } from '../MessageItem';
import { Message } from '../../types';

// Mock clipboard
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};
Object.assign(navigator, { clipboard: mockClipboard });

// Mock CodeBlock to simplify rendering
vi.mock('../CodeBlock', () => ({
    CodeBlock: ({ code, language }: any) => (
        <div data-testid="code-block" data-language={language}>
            {code}
        </div>
    )
}));

describe('MessageItem', () => {
    const defaultMessage: Message = {
        id: '1',
        role: 'model',
        content: 'Hello world',
        timestamp: Date.now(),
    };

    const userMessage: Message = {
        id: '2',
        role: 'user',
        content: 'Hi bot',
        timestamp: Date.now(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders user message correctly', () => {
        render(<MessageItem message={userMessage} isTerminalMode={false} />);
        expect(screen.getByText('Hi bot')).toBeInTheDocument();
        expect(screen.getByText('You')).toBeInTheDocument();
        // Check for specific user styling class or element position if crucial
        // In GUI mode, user messages are usually styled differently (e.g., right aligned or different color)
    });

    it('renders bot message correctly', () => {
        render(<MessageItem message={defaultMessage} isTerminalMode={false} />);
        expect(screen.getByText('Hello world')).toBeInTheDocument();
        expect(screen.getByText('DevOps Assistant')).toBeInTheDocument();
    });

    it('renders thinking process correctly', () => {
        const thinkingMessage: Message = {
            ...defaultMessage,
            content: '<think>Processing logic...</think>Final Answer'
        };
        render(<MessageItem message={thinkingMessage} isTerminalMode={false} />);
        expect(screen.getByText('Thinking Process')).toBeInTheDocument();
        // The thinking content is inside a details element
        expect(screen.getByText('Processing logic...')).toBeInTheDocument();
        expect(screen.getByText('Final Answer')).toBeInTheDocument();
    });

    it('parses Jira tickets correctly', () => {
        const jiraMessage: Message = {
            ...defaultMessage,
            content: 'Check ticket OPS-123 for details.'
        };
        render(<MessageItem message={jiraMessage} isTerminalMode={false} />);
        expect(screen.getByText('OPS-123')).toBeInTheDocument();
        expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    });

    it('handles clipboard copy', async () => {
        render(<MessageItem message={defaultMessage} isTerminalMode={false} />);

        // Find copy button - typically hidden until hover, but accessible in DOM
        // The accessible name might need adjustment or we use a selector
        // Looking at the code: button has SVG but no text for copy icon in GUI mode
        // But in Terminal mode "COPY_RAW" is visible text.

        // Let's test Terminal mode copy specifically as it has clearer text
        render(<MessageItem message={defaultMessage} isTerminalMode={true} />);
        fireEvent.click(screen.getByText('COPY_RAW'));

        expect(mockClipboard.writeText).toHaveBeenCalledWith('Hello world');
    });

    it('enters edit mode for user messages', () => {
        render(<MessageItem message={userMessage} isTerminalMode={false} />);

        // Edit button is usually an icon, might not have text. 
        // Code has `title="Edit Message"` which is good for `getByTitle`
        const editBtn = screen.getByTitle('Edit Message');
        fireEvent.click(editBtn);

        const textarea = screen.getByDisplayValue('Hi bot');
        expect(textarea).toBeInTheDocument();

        fireEvent.change(textarea, { target: { value: 'Hi bot edited' } });
        expect(screen.getByDisplayValue('Hi bot edited')).toBeInTheDocument();
    });
});
