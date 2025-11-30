import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/lib/store";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { userName, userGrade, setUserName, setUserGrade } = useStore();
    const [name, setName] = useState(userName);
    const [grade, setGrade] = useState(userGrade);

    if (!isOpen) return null;

    const handleSave = () => {
        setUserName(name);
        setUserGrade(grade);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Sam"
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-neutral-600 focus:border-white/20 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400">Grade Level</label>
                        <select
                            value={grade}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-white/20 focus:outline-none appearance-none"
                        >
                            <option value="" className="bg-neutral-900 text-neutral-500">Select Grade</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i + 1} value={`${i + 1}`} className="bg-neutral-900">
                                    Grade {i + 1}
                                </option>
                            ))}
                            <option value="College" className="bg-neutral-900">College</option>
                        </select>
                    </div>


                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-full px-6 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-neutral-200 transition-colors"
                    >
                        Save Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
