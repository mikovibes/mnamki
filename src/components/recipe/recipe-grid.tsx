"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export function RecipeGrid({ recipes }: { recipes: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const filters = ["All", "Healthy", "Fast", "High Protein", "Sweet", "Complex"];

    const filteredRecipes = useMemo(() => {
        let result = recipes || [];

        // Apply text search
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(r =>
                r.title.toLowerCase().includes(query) ||
                (r.tags && r.tags.some((tag: string) => tag.toLowerCase().includes(query)))
            );
        }

        // Apply tag filter
        if (activeFilter !== "All") {
            if (activeFilter === "Healthy") {
                result = result.filter(r => r.health_score >= 8);
            } else if (activeFilter === "Fast") {
                result = result.filter(r => parseInt(r.time || "0") <= 30);
            } else {
                result = result.filter(r => r.tags && r.tags.some((tag: string) => tag.toLowerCase() === activeFilter.toLowerCase()));
            }
        }

        return result;
    }, [recipes, searchQuery, activeFilter]);

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search recipes, ingredients..."
                    className="w-full bg-card border border-border shadow-sm rounded-2xl py-2.5 pl-11 pr-4 outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-sm font-medium placeholder:text-muted-foreground/70"
                />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 pt-1 snap-x hide-scrollbar -mx-6 px-6">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`min-w-fit px-4 py-1.5 rounded-full text-sm font-bold transition-all shadow-sm snap-center ${activeFilter === filter
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border text-muted-foreground hover:bg-muted/50'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">
                        {searchQuery || activeFilter !== "All" ? "Search Results" : "Ready to cook"}
                    </h2>
                    <span className="text-sm text-muted-foreground font-medium">{filteredRecipes.length} recipes</span>
                </div>

                {filteredRecipes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredRecipes.map((recipe) => (
                            <Link href={`/recipe/${recipe.id}`} key={recipe.id} className="block">
                                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:ring-2 hover:ring-primary/20 active:scale-[0.98] transition-all cursor-pointer">
                                    <div
                                        className="h-40 bg-accent/30 relative bg-cover bg-center"
                                        style={{ backgroundImage: `url(${recipe.image_url})` }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-[11px] font-bold text-healthy shadow-sm z-10">
                                            {recipe.health_score}/10 Health
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-foreground line-clamp-1">{recipe.title}</h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-sm text-muted-foreground font-medium">{recipe.time}m</p>
                                            {recipe.tags && recipe.tags.length > 0 && (
                                                <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                                                    {recipe.tags[0]}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="w-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-border rounded-2xl bg-muted/20">
                        <p className="text-muted-foreground font-medium">No recipes found.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setActiveFilter("All"); }}
                            className="text-primary text-sm font-bold mt-2 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
}
