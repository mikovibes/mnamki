"use client";

import { useState } from "react";
import Link from "next/link";
import { Grid3X3, Utensils, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileClientProps {
    profile: { id: string; name: string };
    addedRecipes: any[];
    cookedEntries: any[];
    isCurrentUser: boolean;
}

export function ProfileClient({ profile, addedRecipes, cookedEntries, isCurrentUser }: ProfileClientProps) {
    const [activeTab, setActiveTab] = useState<"recipes" | "cooked">("recipes");

    return (
        <main className="min-h-screen bg-background pb-20">
            {/* Header / Navigation */}
            <header className="px-6 pt-12 pb-4 sticky top-0 bg-background/80 backdrop-blur-xl z-10 flex items-center justify-between">
                <Link href="/">
                    <Button variant="ghost" className="rounded-full w-10 h-10 p-0 text-foreground shadow-sm bg-card border border-border">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-lg font-bold tracking-tight text-foreground">{profile.name}'s Profile</h1>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            {/* Profile Info */}
            <section className="px-6 py-8 flex flex-col items-center border-b border-border/50 bg-card">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4 shadow-inner border border-primary/20">
                    {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
                <div className="flex gap-8 mt-6">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-foreground">{addedRecipes.length}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Added</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-foreground">{cookedEntries.length}</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cooked</span>
                    </div>
                </div>
            </section>

            {/* Content Tabs */}
            <div className="flex justify-center border-b border-border/50 sticky top-[88px] bg-background/95 backdrop-blur z-10">
                <button
                    onClick={() => setActiveTab("recipes")}
                    className={`flex-1 py-4 flex justify-center border-b-2 transition-colors ${activeTab === 'recipes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                    <Grid3X3 className="w-6 h-6" />
                </button>
                <button
                    onClick={() => setActiveTab("cooked")}
                    className={`flex-1 py-4 flex justify-center border-b-2 transition-colors ${activeTab === 'cooked' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
                >
                    <Utensils className="w-6 h-6" />
                </button>
            </div>

            {/* Grid Content */}
            <section className="p-1">
                <div className="grid grid-cols-3 gap-1">
                    {activeTab === "recipes" && addedRecipes.map((recipe) => (
                        <Link href={`/recipe/${recipe.id}`} key={recipe.id} className="aspect-square relative block group overflow-hidden bg-accent/30">
                            <img
                                src={recipe.image_url}
                                alt={recipe.title}
                                className="object-cover w-full h-full group-active:scale-95 transition-transform"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold px-2 text-center line-clamp-2 drop-shadow-md">{recipe.title}</span>
                            </div>
                        </Link>
                    ))}

                    {activeTab === "cooked" && cookedEntries.map((entry) => (
                        <Link href={`/recipe/${entry.recipe_id}`} key={entry.id} className="aspect-square relative block group overflow-hidden bg-accent/30">
                            {entry.photos && entry.photos.length > 0 ? (
                                <img
                                    src={entry.photos[0]}
                                    alt="Cooked Entry"
                                    className="object-cover w-full h-full group-active:scale-95 transition-transform"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-card text-muted-foreground/50 border border-border border-dashed p-2">
                                    <Utensils className="w-6 h-6 mb-1 opacity-50" />
                                    <span className="text-[10px] font-bold text-center line-clamp-2">
                                        No Photo
                                    </span>
                                </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-black/50 backdrop-blur-sm rounded-full px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">
                                ★ {entry.rating}
                            </div>
                        </Link>
                    ))}
                </div>

                {activeTab === "recipes" && addedRecipes.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground text-sm">
                        No recipes added yet.
                    </div>
                )}

                {activeTab === "cooked" && cookedEntries.length === 0 && (
                    <div className="py-16 text-center text-muted-foreground text-sm">
                        No cooked entries yet.
                    </div>
                )}
            </section>
        </main>
    );
}
