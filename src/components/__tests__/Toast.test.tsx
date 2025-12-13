import { render, screen } from '@testing-library/react';
import { ToastContainer } from '../Toast';
import { Toast } from '../../types';

describe('ToastContainer', () => {
    const mockToasts: Toast[] = [
        { id: '1', message: 'Success message', type: 'success' },
        { id: '2', message: 'Error message', type: 'error' },
        { id: '3', message: 'Info message', type: 'info' },
    ];

    it('renders list of toasts', () => {
        render(<ToastContainer toasts={mockToasts} isTerminalMode={false} />);
        expect(screen.getByText('Success message')).toBeInTheDocument();
        expect(screen.getByText('Error message')).toBeInTheDocument();
        expect(screen.getByText('Info message')).toBeInTheDocument();
    });

    it('renders correct styling based on type in GUI mode', () => {
        const { container } = render(<ToastContainer toasts={[mockToasts[0]]} isTerminalMode={false} />);
        // Success icon or class check
        expect(container.getElementsByTagName('svg').length).toBeGreaterThan(0);
        // We can check for specific class names if needed, but existence is good for now
    });

    it('renders correct styling in Terminal mode', () => {
        render(<ToastContainer toasts={[mockToasts[0]]} isTerminalMode={true} />);
        const successMsg = screen.getByText('Success message');
        // Check for terminal specific classes (green)
        // The text is inside a div, which is inside the main toast div
        expect(successMsg.parentElement?.className).toContain('text-green-500');
    });
});
