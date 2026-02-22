"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, Camera, Mic, MapPin, Edit3, Loader2 } from "lucide-react";
import { saveCookedEntry } from "@/app/actions/cooked-entries";
import { useRouter } from "next/navigation";

export function MadeItModal({ children, recipeId }: { children: React.ReactNode, recipeId: string }) {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [note, setNote] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                chunksRef.current = [];

                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };

                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                    stream.getTracks().forEach(track => track.stop());

                    // Send to transcription API
                    try {
                        setNote("Transcribing...");
                        const formData = new FormData();
                        formData.append("audio", blob, "voice_note.webm");
                        const res = await fetch("/api/transcribe", {
                            method: "POST",
                            body: formData
                        });
                        const data = await res.json();
                        if (data.text) {
                            setNote(data.text);
                        } else {
                            setNote("");
                            alert("Transcription failed.");
                        }
                    } catch (e) {
                        setNote("");
                        alert("Error transcribing audio.");
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                alert("Microphone access denied.");
            }
        }
    };

    const handleSave = async () => {
        if (rating === 0) {
            alert("Please select a star rating!");
            return;
        }

        setSaving(true);
        const formData = new FormData();
        formData.append("recipeId", recipeId);
        formData.append("rating", rating.toString());
        formData.append("note", note);
        if (imageFile) {
            formData.append("photo", imageFile);
        }

        const res = await saveCookedEntry(formData);
        if (res.success) {
            setOpen(false);
            setRating(0);
            setNote("");
            setImagePreview(null);
            setImageFile(null);
            router.refresh();
        } else {
            alert("Failed to save: " + res.error);
        }
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-border rounded-3xl p-6">
                <DialogHeader className="mb-4 text-center items-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-2">
                        <Star className="w-6 h-6 text-primary fill-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold tracking-tight">We made it!</DialogTitle>
                    <p className="text-muted-foreground text-sm">How was it tonight?</p>
                </DialogHeader>

                <div className="flex flex-col gap-6">
                    {/* Rating */}
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                className="transition-all active:scale-90"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                <Star
                                    className={`w-10 h-10 ${star <= (hoverRating || rating)
                                        ? "text-primary fill-primary"
                                        : "text-muted stroke-[1.5]"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>

                    {/* Photo Upload */}
                    <div
                        className="h-32 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer relative overflow-hidden group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handlePhotoSelect}
                        />
                        {imagePreview ? (
                            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imagePreview})` }}>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-semibold">Change Photo</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Camera className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-sm font-medium">Add a photo of your meal</span>
                            </>
                        )}
                    </div>

                    {/* Voice / Notes */}
                    <div className="relative">
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Any tweaks or thoughts? Dictate or type..."
                            className="w-full h-24 bg-muted/50 rounded-2xl p-4 pr-12 outline-none focus:ring-2 focus:ring-primary/50 resize-none text-sm placeholder:text-muted-foreground transition-all font-medium"
                            disabled={isRecording || note === "Transcribing..."}
                        />
                        <button
                            className={`absolute right-3 bottom-3 p-2 shadow-sm border rounded-full transition-colors active:scale-95 ${isRecording ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-background border-border text-primary hover:bg-primary/10'}`}
                            onClick={toggleRecording}
                            type="button"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full rounded-full py-6 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                        {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Memory"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
