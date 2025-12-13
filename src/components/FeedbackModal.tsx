import React, { useState } from 'react';
import { metricsService } from '../services/metricsService';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    isTerminalMode: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, isTerminalMode }) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) return;

        setIsSubmitting(true);
        try {
            // we use 'GENERAL_REQ' as a special messageId for general requirements
            await metricsService.trackFeedback('GENERAL_REQ', 0, comment);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setComment('');
                onClose();
            }, 2000);
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setIsSubmitting(false);
        }
    };

    const containerClasses = isTerminalMode
        ? 'bg-black border border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] text-green-500 font-mono'
        : 'bg-white border border-slate-200 shadow-2xl text-slate-800 font-sans';

    const inputClasses = isTerminalMode
        ? 'bg-black border border-green-500/50 text-green-400 focus:border-green-400 placeholder-green-800'
        : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-400';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-md rounded-lg p-6 relative ${containerClasses}`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <h2 className="text-lg font-bold mb-1 uppercase tracking-wider">
                    {isTerminalMode ? '> SUBMIT_REQUIREMENTS' : 'Share Feedback'}
                </h2>
                <p className={`text-xs mb-6 ${isTerminalMode ? 'text-green-700' : 'text-slate-500'}`}>
                    Help us understand your requirements better.
                </p>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isTerminalMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'}`}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <p className="font-bold">Feedback Received</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder={isTerminalMode ? "Enter system requirements..." : "What can we improve?..."}
                                className={`w-full h-32 p-3 rounded-md text-sm resize-none focus:outline-none transition-all ${inputClasses}`}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded hover:bg-opacity-10 transition-colors ${isTerminalMode ? 'text-green-600 hover:bg-green-500' : 'text-slate-500 hover:bg-slate-500'}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!comment.trim() || isSubmitting}
                                className={`px-4 py-2 text-xs font-bold uppercase rounded shadow-lg transition-all 
                                    ${isTerminalMode
                                        ? 'bg-green-600 text-black hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
