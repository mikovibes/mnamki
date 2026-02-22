"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Mic, Image as ImageIcon, Check, Square, X } from "lucide-react";
import { saveRecipe } from "@/app/actions/recipe";

export function MagicAdd() {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [result, setResult] = useState<any>(null);
    const router = useRouter();

    // Media States
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleMagicAdd = async () => {
        if (!content.trim() && !audioBlob && !imageBase64) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("text", content);
        if (audioBlob) {
            formData.append("audio", audioBlob, "dictation.webm");
        }
        if (imageBase64) {
            formData.append("image", imageBase64);
        }

        try {
            const res = await fetch("/api/magic-add", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setResult(data);
        } catch (e: any) {
            console.error(e);
            alert("Extraction failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!result) return;
        setSaving(true);
        try {
            const saved = await saveRecipe(result);
            if (saved?.id) {
                router.push(`/recipe/${saved.id}`);
            }
        } catch (e) {
            console.error("Failed to save:", e);
            alert("Failed to save: " + e);
        } finally {
            setSaving(false);
        }
    };

    // --- Audio Recording ---
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

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                    setAudioBlob(blob);
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorder.start();
                setIsRecording(true);
            } catch (err) {
                alert("Microphone access denied.");
            }
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Remove the onstop handler so we don't save the blob
            mediaRecorderRef.current.onstop = null;
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            chunksRef.current = [];
        }
    };

    // --- Image Uploading ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageBase64(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    if (result) {
        return (
            <Card className="border-primary/20 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-300">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <div className="bg-healthy/20 p-2 rounded-full">
                            <Check className="text-healthy w-5 h-5" />
                        </div>
                        Recipe Extracted
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold text-foreground text-lg">{result.title}</p>
                    <div className="flex gap-4 mt-2 mb-4">
                        <p className="text-sm text-muted-foreground">
                            Health Score: <span className="text-healthy font-bold">{result.health_score}/10</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Time: <span className="font-bold">{result.time}m</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="w-full text-muted-foreground"
                            disabled={saving}
                            onClick={() => setResult(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold"
                            disabled={saving}
                            onClick={handleSave}
                        >
                            {saving ? "Saving..." : "Save Recipe"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border shadow-sm overflow-hidden bg-card transition-all duration-200 focus-within:ring-2 focus-within:ring-primary/50">
            <div className="px-4 py-3 bg-primary/10 flex items-center justify-between text-primary-foreground border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-primary">AI Magic Add</span>
                </div>
            </div>

            <CardContent className="p-0 flex flex-col relative w-full h-full">
                {/* Recording Overlay Popup */}
                {isRecording && (
                    <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center rounded-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                                <div className="w-4 h-4 rounded-full bg-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Listening...</h3>
                                <p className="text-xs text-muted-foreground">Speak your recipe</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={cancelRecording}
                                variant="outline"
                                className="rounded-full font-semibold px-6 border-border"
                            >
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                onClick={toggleRecording}
                                className="rounded-full font-bold px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                <Check className="w-4 h-4 mr-2" /> Finish
                            </Button>
                        </div>
                    </div>
                )}

                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste recipe text, URL, or dictate what you cooked..."
                    className="w-full h-24 p-4 bg-transparent resize-none outline-none text-foreground placeholder-muted-foreground text-sm"
                />

                {/* Media Previews */}
                {(audioBlob || imageBase64) && (
                    <div className="px-4 pb-2 flex gap-3 overflow-x-auto hide-scrollbar relative z-10">
                        {audioBlob && (
                            <div className="flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                                <Mic className="w-3.5 h-3.5" /> Voice attached
                                <button onClick={() => setAudioBlob(null)} className="ml-1 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                        {imageBase64 && (
                            <div className="flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                                <ImageIcon className="w-3.5 h-3.5" /> Photo attached
                                <button onClick={() => setImageBase64(null)} className="ml-1 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between px-4 pb-4 relative z-10">
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                        <button
                            onClick={toggleRecording}
                            className={`p-2.5 rounded-full transition-colors active:scale-95 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        >
                            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 bg-muted text-muted-foreground hover:bg-muted/80 rounded-full transition-colors active:scale-95"
                        >
                            <ImageIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <Button
                        disabled={(!content.trim() && !audioBlob && !imageBase64) || loading}
                        onClick={handleMagicAdd}
                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 transition-all active:scale-95 font-bold shadow-sm"
                        size="sm"
                    >
                        {loading ? "Thinking..." : "Extract"}
                    </Button>
                </div>
            </CardContent>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </Card>
    );
}
