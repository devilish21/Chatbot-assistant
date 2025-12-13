import { render, screen, fireEvent } from '@testing-library/react';
import { PromptLibrary } from '../PromptLibrary';
import { Snippet } from '../../types';
import { DEFAULT_SNIPPETS } from '../../constants';

// Test Defaults independently
describe('PromptLibrary Defaults', () => {
    it('contains exactly 34 default tool prompts', () => {
        expect(DEFAULT_SNIPPETS.length).toBe(34);
    });
});

// Test Component
describe('PromptLibrary Component', () => {
    const mockOnClose = vi.fn();
    const mockSetSnippets = vi.fn();
    const mockOnSelect = vi.fn();

    const mockSnippets: Snippet[] = [
        { id: '1', title: 'Test Prompt', content: 'Test Content', category: 'test-tool' },
        { id: '2', title: 'Simple Prompt', content: 'Simple Content' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when not open', () => {
        const { container } = render(
            <PromptLibrary
                isOpen={false}
                onClose={mockOnClose}
                isTerminalMode={false}
                snippets={mockSnippets}
                setSnippets={mockSetSnippets}
                onSelect={mockOnSelect}
            />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders snippets when open', () => {
        render(
            <PromptLibrary
                isOpen={true}
                onClose={mockOnClose}
                isTerminalMode={false}
                snippets={mockSnippets}
                setSnippets={mockSetSnippets}
                onSelect={mockOnSelect}
            />
        );
        expect(screen.getByText('Prompt Library')).toBeInTheDocument();
        expect(screen.getByText('Test Prompt')).toBeInTheDocument();
        expect(screen.getByText('Simple Prompt')).toBeInTheDocument();
    });

    it('calls onSelect with content and category when clicked', () => {
        render(
            <PromptLibrary
                isOpen={true}
                onClose={mockOnClose}
                isTerminalMode={false}
                snippets={mockSnippets}
                setSnippets={mockSetSnippets}
                onSelect={mockOnSelect}
            />
        );

        fireEvent.click(screen.getByText('Test Prompt'));
        expect(mockOnSelect).toHaveBeenCalledWith('Test Content', 'test-tool');
    });

    it('calls onSelect with undefined category if missing', () => {
        render(
            <PromptLibrary
                isOpen={true}
                onClose={mockOnClose}
                isTerminalMode={false}
                snippets={mockSnippets}
                setSnippets={mockSetSnippets}
                onSelect={mockOnSelect}
            />
        );

        fireEvent.click(screen.getByText('Simple Prompt'));
        expect(mockOnSelect).toHaveBeenCalledWith('Simple Content', undefined);
    });

    it('switches to add mode and back', () => {
        render(
            <PromptLibrary
                isOpen={true}
                onClose={mockOnClose}
                isTerminalMode={false}
                snippets={[]}
                setSnippets={mockSetSnippets}
                onSelect={mockOnSelect}
            />
        );

        fireEvent.click(screen.getByText('+ New Snippet'));
        expect(screen.getByPlaceholderText('e.g. K8s Audit Template')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Cancel'));
        expect(screen.getByText('+ New Snippet')).toBeInTheDocument();
    });
});
