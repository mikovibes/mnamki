"use client";

import { useState } from "react";
import { ShoppingCart, Copy, Check, ChevronDown, ListPlus, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

type Recipe = { id: string; title: string; ingredients: any[] };

export function ShoppingListGenerator({
    recipes,
    pantryItems
}: {
    recipes: Recipe[],
    pantryItems: any[]
}) {
    const [selectedRecipes, setSelectedRecipes] = useState<Record<string, boolean>>({});
    const [generatedList, setGeneratedList] = useState<any[] | null>(null);
    const [copied, setCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // This is a simplified matching logic. GPT-4o extracts exact quantities but matching 
    // strings like "1 cup milk" against pantry "Milk: 1 gallon" is complex purely client side.
    // For the MVP, we assume if the word exists in the pantry, we have it, else we need it. 

    const handleGenerate = () => {
        // Collect all ingredients from selected recipes
        let neededIngredients: any[] = [];
        Object.entries(selectedRecipes).forEach(([recipeId, isSelected]) => {
            if (isSelected) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe && recipe.ingredients) {
                    neededIngredients.push(...recipe.ingredients);
                }
            }
        });

        // Filter out items we already have in the pantry
        const missing = neededIngredients.filter(req => {
            if (!req.name) return false;
            const haveIt = pantryItems.some(p => p.name.toLowerCase().includes(req.name.toLowerCase()));
            return !haveIt;
        });

        setGeneratedList(missing);
    };

    const copyToClipboard = () => {
        if (!generatedList) return;
        const text = generatedList.map(item => `- [ ] ${item.quantity || ''} ${item.unit || ''} ${item.name}`.trim()).join('\n');
        navigator.clipboard.writeText(`🛒 Shopping List:\n${text}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-2xl py-6 font-bold shadow-sm transition-all active:scale-[0.98]">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Plan Shopping
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border rounded-3xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold tracking-tight">Generate List</DialogTitle>
                    <p className="text-sm text-muted-foreground">Select recipes to cross-reference with your Shared Pantry.</p>
                </DialogHeader>

                {!generatedList ? (
                    <div className="space-y-4">
                        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
                            {recipes.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">No recipes saved yet.</p>
                            ) : recipes.map(recipe => (
                                <label key={recipe.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${selectedRecipes[recipe.id] ? 'bg-primary/10 border-primary/30' : 'border-border'}`}>
                                    <Checkbox
                                        checked={!!selectedRecipes[recipe.id]}
                                        onCheckedChange={(c) => setSelectedRecipes(p => ({ ...p, [recipe.id]: c as boolean }))}
                                    />
                                    <span className="font-semibold text-sm line-clamp-1">{recipe.title}</span>
                                </label>
                            ))}
                        </div>

                        <Button
                            className="w-full rounded-2xl font-bold py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={Object.values(selectedRecipes).filter(Boolean).length === 0}
                            onClick={handleGenerate}
                        >
                            <ListPlus className="w-5 h-5 mr-2" />
                            Generate List
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-muted/50 rounded-2xl p-4">
                            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                                Missing Ingredients
                                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full">{generatedList.length}</span>
                            </h3>

                            {generatedList.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-2">You have everything in your pantry! 🎉</p>
                            ) : (
                                <ul className="space-y-2">
                                    {generatedList.map((item, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2 text-foreground font-medium">
                                            <div className="w-4 h-4 mt-0.5 rounded border border-border shrink-0" />
                                            <span>{item.quantity} {item.unit} {item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 rounded-xl font-bold h-12" onClick={() => setGeneratedList(null)}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <Button
                                className={`flex-1 rounded-xl font-bold h-12 transition-all ${copied ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                                onClick={copyToClipboard}
                            >
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                {copied ? 'Copied' : 'Copy List'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
