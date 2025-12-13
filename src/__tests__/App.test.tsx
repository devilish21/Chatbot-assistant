import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

// Mock child components to focus on routing/state integration
vi.mock('../components/ChatInterface', () => ({
    ChatInterface: ({ onOpenPromptLibrary }: any) => (
        <div data-testid="chat-interface">
            ChatInterface
            <button onClick={onOpenPromptLibrary}>Open Lib</button>
        </div>
    )
}));

vi.mock('../components/AdminPanel', () => ({
    AdminPanel: () => <div data-testid="admin-panel">AdminPanel</div>
}));

vi.mock('../components/PromptLibrary', () => ({
    PromptLibrary: ({ isOpen }: any) => isOpen ? <div data-testid="prompt-library">PromptLibrary</div> : null
}));

describe('App Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders chat interface by default', async () => {
        render(<App />);
        expect(await screen.findByTestId('chat-interface')).toBeInTheDocument();
    });

    it('loads default snippets into local storage on mount', async () => {
        render(<App />);
        await waitFor(() => {
            const stored = localStorage.getItem('devops_chatbot_snippets');
            expect(stored).toBeTruthy();
            expect(JSON.parse(stored!)).toHaveLength(34); // Expect our 34 defaults
        });
    });

    it('opens prompt library when triggered from chat interface', async () => {
        render(<App />);
        const chat = await screen.findByTestId('chat-interface');
        // Find the button we mocked in ChatInterface
        const openLibBtn = screen.getByText('Open Lib');
        openLibBtn.click();

        expect(await screen.findByTestId('prompt-library')).toBeInTheDocument();
    });
});
