"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Star, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ActivityFeed({ recipeId, initialEntries, currentUser }: { recipeId: string, initialEntries: any[], currentUser: any }) {
    const [entries, setEntries] = useState(initialEntries);
    const [newComment, setNewComment] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        // Subscribe to both cooked_entries and comments for this recipe
        const channel = supabase.channel(`activity-${recipeId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cooked_entries', filter: `recipe_id=eq.${recipeId}` }, (payload) => {
                fetchEntryDetails('cooked_entries', payload.new.id);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `recipe_id=eq.${recipeId}` }, (payload) => {
                fetchEntryDetails('comments', payload.new.id);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [recipeId]);

    const fetchEntryDetails = async (table: string, id: string) => {
        const { data } = await supabase.from(table).select('*, profiles(name)').eq('id', id).single();
        if (data) {
            const entry = { ...data, type: table === 'comments' ? 'comment' : 'cooked_entry' };
            setEntries(prev => [entry, ...prev].sort((a, b) => new Date(b.created_at || b.cooked_at).getTime() - new Date(a.created_at || a.cooked_at).getTime()));
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim()) return;
        setSending(true);

        const { error } = await supabase.from('comments').insert({
            recipe_id: recipeId,
            profile_id: currentUser.id,
            content: newComment.trim()
        });

        if (error) {
            console.error(error);
            alert("Failed to send comment");
        } else {
            setNewComment("");
        }
        setSending(false);
    };

    if (entries.length === 0) return null;

    return (
        <div className="mt-12 bg-card rounded-3xl p-6 shadow-sm border border-border">
            <h3 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2">
                Activity
                <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{entries.length}</span>
            </h3>

            <div className="space-y-6">
                {entries.map(entry => {
                    const isMadeIt = entry.type === 'cooked_entry' || entry.rating;
                    const date = new Date(entry.cooked_at || entry.created_at);

                    return (
                        <div key={`${entry.type}-${entry.id}`} className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary shrink-0 flex items-center justify-center font-bold text-secondary-foreground">
                                {entry.profiles?.name?.[0]}
                            </div>
                            <div className="flex-1 bg-muted/30 rounded-2xl rounded-tl-none p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-foreground">{entry.profiles?.name}</span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {formatDistanceToNow(date, { addSuffix: true })}
                                    </span>
                                </div>

                                {isMadeIt && (
                                    <>
                                        <div className="flex gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`w-3.5 h-3.5 ${star <= entry.rating ? 'fill-primary text-primary' : 'text-muted-foreground/30'}`} />
                                            ))}
                                            <span className="text-xs font-bold text-primary ml-1 uppercase tracking-wider">Made It</span>
                                        </div>
                                        {entry.photos?.[0] && (
                                            <div className="h-40 bg-cover bg-center rounded-xl mb-3 shadow-sm border border-border" style={{ backgroundImage: `url(${entry.photos[0]})` }} />
                                        )}
                                        {entry.notes && <p className="text-sm leading-relaxed text-foreground">{entry.notes}</p>}
                                    </>
                                )}

                                {!isMadeIt && (
                                    <p className="text-sm leading-relaxed text-foreground">{entry.content}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-muted/50 rounded-full px-5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground font-medium"
                    onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                />
                <Button
                    size="icon"
                    onClick={handleSendComment}
                    disabled={sending || !newComment.trim()}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 w-11 h-11"
                >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                </Button>
            </div>
        </div>
    );
}
