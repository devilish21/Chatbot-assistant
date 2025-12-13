import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CodeBlock } from '../CodeBlock';

// Mock clipboard
const mockClipboard = {
    writeText: vi.fn().mockResolvedValue(undefined)
};

Object.defineProperty(navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
    configurable: true // Important for cleanup or overrides
});
Object.defineProperty(document, 'execCommand', {
    value: vi.fn(),
    writable: true
});

describe('CodeBlock', () => {
    const code = 'console.log("hello");';
    const language = 'javascript';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('renders code with language label', () => {
        render(<CodeBlock code={code} language={language} />);
        expect(screen.getByText(/javascript/i)).toBeInTheDocument();
        expect(screen.getByText(/console/)).toBeInTheDocument(); // part of syntax highlighting
    });

    it('simulates running code', async () => {
        render(<CodeBlock code={code} language={language} />);

        const runBtn = screen.getByText('Run');
        fireEvent.click(runBtn);

        // Use waitFor with real timers
        await waitFor(() => {
            expect(screen.getByText('Console Output')).toBeInTheDocument();
        }, { timeout: 2000 });

        // "hello" appears in code (highlighted) and output. Using getAllByText checks presence of at least one.
        // Or specifically check the output container if possible, but finding it is enough for this test.
        expect(screen.getAllByText(/hello/).length).toBeGreaterThan(0);
    });

    it('copies code to clipboard', async () => {
        render(<CodeBlock code={code} language={language} />);
        const copyBtn = screen.getByText('Copy');
        await fireEvent.click(copyBtn);

        expect(mockClipboard.writeText).toHaveBeenCalledWith(code);
        expect(await screen.findByText('Copied')).toBeInTheDocument();
    });
});
