"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function PantryClient({ initialItems, userId }: { initialItems: any[], userId: string }) {
    const [items, setItems] = useState(initialItems);
    const [search, setSearch] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemQty, setNewItemQty] = useState("");
    const [newItemUnit, setNewItemUnit] = useState("");
    const [adding, setAdding] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Realtime subscription for pantry updates
        const channel = supabase
            .channel('pantry_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pantry_items' },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setItems(prev => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)));
                    } else if (payload.eventType === 'DELETE') {
                        setItems(prev => prev.filter(item => item.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setItems(prev => prev.map(item => item.id === payload.new.id ? payload.new : item).sort((a, b) => a.name.localeCompare(b.name)));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        setAdding(true);
        try {
            const { error } = await supabase.from('pantry_items').insert({
                name: newItemName.trim(),
                quantity: newItemQty ? parseFloat(newItemQty) : null,
                unit: newItemUnit.trim() || null,
                added_by: userId
            });

            if (error) throw error;

            setNewItemName("");
            setNewItemQty("");
            setNewItemUnit("");
        } catch (err) {
            console.error("Error adding item:", err);
            alert("Failed to add item");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase.from('pantry_items').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error("Error deleting item:", err);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background pb-32">
            <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border/50">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-secondary/80 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Our Pantry</h1>
                        <p className="text-sm font-medium text-muted-foreground">{items.length} ingredients</p>
                    </div>
                </div>
                <div className="relative mt-4">
                    <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                    <input
                        type="text"
                        placeholder="Search our fridge & pantry..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-card border border-border shadow-sm rounded-2xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm font-medium placeholder:text-muted-foreground/70"
                    />
                </div>
            </header>

            <div className="px-6 space-y-6 mt-6">
                {/* Add Item Form */}
                <form onSubmit={handleAddItem} className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ingredient name (e.g. Eggs)"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="flex-1 bg-muted/50 border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:bg-background focus:border-primary/50 transition-all font-medium"
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Qty"
                            value={newItemQty}
                            onChange={(e) => setNewItemQty(e.target.value)}
                            className="w-20 bg-muted/50 border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:bg-background focus:border-primary/50 transition-all font-medium"
                        />
                        <input
                            type="text"
                            placeholder="Unit (e.g. oz, whole)"
                            value={newItemUnit}
                            onChange={(e) => setNewItemUnit(e.target.value)}
                            className="flex-1 bg-muted/50 border border-transparent rounded-xl px-3 py-2 text-sm outline-none focus:bg-background focus:border-primary/50 transition-all font-medium"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={adding || !newItemName.trim()}
                            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                        >
                            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </Button>
                    </div>
                </form>

                {/* List */}
                <div className="space-y-3">
                    {filteredItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm">
                            <div>
                                <p className="font-semibold text-foreground capitalize">{item.name}</p>
                                <p className="text-sm text-muted-foreground font-medium mt-0.5">
                                    {item.quantity ? `${item.quantity} ${item.unit || ''}` : 'In Stock'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                                className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full h-8 w-8"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}

                    {filteredItems.length === 0 && search && (
                        <div className="py-8 text-center text-muted-foreground text-sm font-medium">
                            No ingredients found for "{search}"
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
