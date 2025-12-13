import { render, screen, fireEvent } from '@testing-library/react';
import { AdminLogin } from '../AdminLogin';

describe('AdminLogin', () => {
    const mockOnLogin = vi.fn();
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form', () => {
        render(<AdminLogin onLogin={mockOnLogin} isTerminalMode={false} />);
        expect(screen.getByText('Admin System')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    });

    it('shows error on empty submission', () => {
        render(<AdminLogin onLogin={mockOnLogin} isTerminalMode={false} />);
        fireEvent.click(screen.getByText('Authenticate'));
        expect(screen.getByText('Access Denied: Invalid Credentials')).toBeInTheDocument();
        expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('shows error on incorrect password', () => {
        render(<AdminLogin onLogin={mockOnLogin} isTerminalMode={false} />);
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrong' } });
        fireEvent.click(screen.getByText('Authenticate'));
        expect(screen.getByText('Access Denied: Invalid Credentials')).toBeInTheDocument();
        expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('calls onLogin with correct password', () => {
        render(<AdminLogin onLogin={mockOnLogin} isTerminalMode={false} />);
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'admin123' } });
        fireEvent.click(screen.getByText('Authenticate'));
        expect(mockOnLogin).toHaveBeenCalledTimes(1);
    });
});
