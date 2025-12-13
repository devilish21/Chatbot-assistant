import { render, screen, fireEvent } from '@testing-library/react';
import { AdminPanel } from '../AdminPanel';
import { AppConfig } from '../../types';

// Mock recharts to avoid complex SVG rendering issues in tests
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
    AreaChart: () => <div>AreaChart</div>,
    BarChart: () => <div>BarChart</div>,
    Area: () => <div>Area</div>,
    Bar: () => <div>Bar</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
}));

describe('AdminPanel', () => {
    const mockOnClose = vi.fn();
    const mockOnConfigChange = vi.fn();
    const defaultConfig: AppConfig = {
        endpoint: 'test',
        model: 'test-model',
        temperature: 0.7,
        enableSuggestions: true,
        enableVisualEffects: false,
        toolSafety: false,
        activeCategories: [],
        maxOutputTokens: 1000,
        contextWindowSize: 2000,
        botName: 'TestBot',
        welcomeMessage: 'Welcome',
        systemAlert: '',
        systemInstruction: ''
    };

    const defaultProps = {
        config: defaultConfig,
        onSaveConfig: vi.fn(), // Replaces onConfigChange
        onClose: mockOnClose,
        isAuthenticated: true,
        // Mock session data if needed
        sessions: [],
        isOpen: true,
        isTerminalMode: false,
        addToast: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders sidebar navigation', () => {
        render(<AdminPanel {...defaultProps} />);
        expect(screen.getByText('General Settings')).toBeInTheDocument();
        expect(screen.getByText('LLM Configuration')).toBeInTheDocument();
        expect(screen.getByText('System Broadcasts')).toBeInTheDocument();
        expect(screen.getByText('System Metrics')).toBeInTheDocument();
    });

    it('renders general settings by default', () => {
        render(<AdminPanel {...defaultProps} />);
        expect(screen.getByText('General Interface Settings')).toBeInTheDocument();
        expect(screen.getByText('Bot Name')).toBeInTheDocument();
    });

    it('navigates to settings tab', () => {
        // Since it's default, we switch to another tab first then back, or just verify it works
        // But testing navigation implies starting elsewhere. 
        // Let's keep it simple: Just render and check presence as done above. 
        // Or if we want to test click:
        render(<AdminPanel {...defaultProps} />);
        // Click LLM config
        fireEvent.click(screen.getByText('LLM Configuration'));
        expect(screen.getByText('Language Model Configuration')).toBeInTheDocument();

        // Click back to General (which was Global in legacy code, now General Settings)
        fireEvent.click(screen.getByText('General Settings'));
        expect(screen.getByText('General Interface Settings')).toBeInTheDocument();
    });

    it('navigates to broadcasts tab', () => {
        render(<AdminPanel {...defaultProps} />);
        // Use getAllByText because title and button might match. Sidebar button usually first.
        const buttons = screen.getAllByText('System Broadcasts');
        fireEvent.click(buttons[0]);

        expect(screen.getAllByText('System Broadcasts').length).toBeGreaterThan(0);
        expect(screen.getByText('Active Alert Banner')).toBeInTheDocument();
    });



    it('calls onClose when logout/back is clicked', () => {
        render(<AdminPanel {...defaultProps} />);
        const logoutBtn = screen.getByText('Exit & Logout');
        fireEvent.click(logoutBtn);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
