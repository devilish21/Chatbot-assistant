import React from 'react';

interface FeedbackInboxProps {
    feedback: any[];
    isTerminalMode: boolean;
}

export const FeedbackInbox: React.FC<FeedbackInboxProps> = ({ feedback, isTerminalMode }) => {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedback.length > 0 ? feedback.map((fb: any) => (
                    <div key={fb.id} className={`p-4 rounded-lg border flex flex-col gap-2 ${isTerminalMode ? 'border-green-500/30 bg-green-900/10' : 'border-slate-200 bg-white'}`}>
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-full ${fb.rating === 1 ? (isTerminalMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600') : (isTerminalMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600')}`}>
                                {fb.rating === 1 ?
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg> :
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                                }
                            </div>
                            <span className="text-[10px] opacity-50 font-mono">{new Date(fb.timestamp).toLocaleString()}</span>
                        </div>
                        <h4 className="text-xs font-bold uppercase opacity-80 mt-1">User Comment</h4>
                        <p className="text-sm italic opacity-90">{fb.comment || "No comment provided."}</p>
                        <div className="mt-auto px-2 py-1 rounded bg-black/5 text-[10px] font-mono opacity-50 truncate">
                            Msg ID: {fb.message_id}
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center opacity-50">
                        <p>No feedback details available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
