import React, { useState } from 'react';
import { metricsService } from '../services/metricsService';

interface FeedbackButtonsProps {
    messageId: string;
    isTerminalMode: boolean;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({ messageId, isTerminalMode }) => {
    const [rating, setRating] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRate = async (newRating: number) => {
        if (isSubmitting || rating === newRating) return;

        setIsSubmitting(true);
        // Optimistic update
        setRating(newRating);

        try {
            await metricsService.trackFeedback(messageId, newRating);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            // Revert on failure
            setRating(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const baseClasses = "p-1 rounded transition-all duration-200 flex items-center justify-center";
    const activeScale = "scale-110";

    // Styles for Terminal Mode (Hacker Style)
    const terminalStyles = {
        up: `hover:bg-green-900/40 hover:text-green-400 ${rating === 1 ? 'text-green-400 bg-green-900/30' : 'text-green-800'}`,
        down: `hover:bg-red-900/40 hover:text-red-400 ${rating === -1 ? 'text-red-400 bg-red-900/30' : 'text-green-800'}`
    };

    // Styles for GUI Mode (Corporate Style)
    const guiStyles = {
        up: `hover:bg-indigo-50 hover:text-indigo-600 ${rating === 1 ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'}`,
        down: `hover:bg-red-50 hover:text-red-500 ${rating === -1 ? 'text-red-500 bg-red-50' : 'text-gray-400'}`
    };

    const styles = isTerminalMode ? terminalStyles : guiStyles;

    return (
        <div className="flex items-center gap-1 mt-1 opacity-10 group-hover:opacity-100 transition-opacity duration-300">
            <button
                onClick={() => handleRate(1)}
                disabled={isSubmitting}
                className={`${baseClasses} ${styles.up} ${rating === 1 ? activeScale : ''}`}
                title="Helpful"
                aria-label="Mark as helpful"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                </svg>
            </button>
            <button
                onClick={() => handleRate(-1)}
                disabled={isSubmitting}
                className={`${baseClasses} ${styles.down} ${rating === -1 ? activeScale : ''}`}
                title="Not Helpful"
                aria-label="Mark as not helpful"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                </svg>
            </button>
        </div>
    );
};
