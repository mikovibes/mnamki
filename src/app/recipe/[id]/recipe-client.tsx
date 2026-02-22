"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Bookmark, MessageCircle, Share, Maximize2, X, ChevronRight, ChevronLeft, Clock, Flame, ArrowLeft } from "lucide-react";
import { MadeItModal } from "@/components/recipe/made-it-modal";
import { ActivityFeed } from "@/components/recipe/activity-feed";
import { useRouter } from "next/navigation";
import { updateRecipe } from "@/app/actions/recipe";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Save, Trash2, Plus } from "lucide-react";

export function RecipeClient({ recipe, initialEntries, currentUser }: { recipe: any, initialEntries: any[], currentUser: any }) {
    const [cookingMode, setCookingMode] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(recipe);
    const [isSaving, setIsSaving] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const router = useRouter();

    const isOwner = currentUser?.id === recipe.creator_id;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: recipe.title,
                    text: `Check out this recipe for ${recipe.title} on Manamki!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const scrollToComments = () => {
        document.getElementById('activity-feed')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Clean up empty steps/ingredients
            const cleanedData = {
                ...editData,
                ingredients: editData.ingredients.filter((i: any) => i.name?.trim()),
                steps: editData.steps.filter((s: string) => s?.trim())
            };
            await updateRecipe(recipe.id, cleanedData);
            window.location.reload();
        } catch (e: any) {
            alert("Failed to save: " + e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleIngredient = (idx: number) => {
        setCheckedIngredients(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    if (cookingMode) {
        return (
            <div className="fixed inset-0 bg-background z-50 flex flex-col pt-12">
                <div className="flex items-center justify-between px-6 mb-8">
                    <div className="flex gap-2 text-muted-foreground">
                        <span className="font-bold text-foreground">Step {currentStep + 1}</span>
                        <span>of {recipe.steps.length}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setCookingMode(false)}>
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-center px-8 text-center">
                    <p className="text-3xl font-medium leading-relaxed tracking-tight">
                        {recipe.steps[currentStep]}
                    </p>
                </div>

                <div className="p-8 pb-12 flex justify-between items-center bg-card border-t border-border">
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-2xl"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep(p => p - 1)}
                    >
                        <ChevronLeft className="w-6 h-6 mr-2" />
                        Prev
                    </Button>

                    <div className="flex gap-2">
                        {[5, 10, 15].map(min => (
                            <Button key={min} variant="secondary" className="rounded-full font-bold">
                                {min}m
                            </Button>
                        ))}
                    </div>

                    <Button
                        size="lg"
                        className="rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground"
                        disabled={currentStep === recipe.steps.length - 1}
                        onClick={() => setCurrentStep(p => p + 1)}
                    >
                        Next
                        <ChevronRight className="w-6 h-6 ml-2" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-background pb-32">
            {/* Hero Image */}
            <div
                className="w-full h-80 bg-cover bg-center relative"
                style={{ backgroundImage: `url(${recipe.image})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                <button
                    onClick={() => router.push("/")}
                    className="absolute top-6 left-6 w-10 h-10 bg-background/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Creator Badge */}
                <div className="absolute top-6 right-6 bg-background/80 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2 shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                        {recipe.creator[0]}
                    </div>
                    <span className="text-xs font-semibold text-foreground">Added by {recipe.creator}</span>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-10">
                <div className="flex justify-between items-start">
                    {isEditing ? (
                        <Input
                            value={editData.title}
                            onChange={e => setEditData({ ...editData, title: e.target.value })}
                            className="text-3xl font-bold h-12 bg-card mb-2"
                        />
                    ) : (
                        <h1 className="text-3xl font-bold tracking-tight text-foreground pr-10">{recipe.title}</h1>
                    )}

                    {/* Edit Action Button */}
                    {isOwner && !isEditing && (
                        <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} className="rounded-full shrink-0">
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    )}
                    {isOwner && isEditing && (
                        <Button onClick={handleSave} disabled={isSaving} className="rounded-full shrink-0 font-bold bg-primary hover:bg-primary/90">
                            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
                        </Button>
                    )}
                </div>

                {/* Stats Row */}
                <div className="flex gap-4 mt-4 py-3 border-y border-border/50">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {isEditing ? (
                            <Input value={editData.time?.replace('m', '') || "20"} onChange={e => setEditData({ ...editData, time: e.target.value })} className="w-16 h-8 text-sm" type="number" />
                        ) : (
                            <span className="text-sm font-medium">{recipe.time}</span>
                        )}
                        {isEditing && <span className="text-sm">min</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-healthy">
                        <Flame className="w-4 h-4" />
                        {isEditing ? (
                            <Input value={editData.health_score || 5} onChange={e => setEditData({ ...editData, health_score: e.target.value })} className="w-12 h-8 text-sm" type="number" min="1" max="10" />
                        ) : (
                            <span className="text-sm font-bold">{recipe.health_score}/10 Health</span>
                        )}
                        {isEditing && <span className="text-sm">/ 10</span>}
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {recipe.tags?.map((tag: string) => (
                        <span key={tag} className="px-3 py-1 bg-secondary rounded-full text-xs font-semibold text-secondary-foreground">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Ingredients */}
                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-foreground">Ingredients</h2>
                        {isEditing && (
                            <Button variant="ghost" size="sm" onClick={() => setEditData({ ...editData, ingredients: [...editData.ingredients, { name: "", quantity: "", unit: "" }] })}>
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {isEditing ? (
                            editData.ingredients.map((ing: any, idx: number) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <Input placeholder="Qty" value={ing.quantity || ""} onChange={e => {
                                        const newIngs = [...editData.ingredients];
                                        newIngs[idx].quantity = e.target.value;
                                        setEditData({ ...editData, ingredients: newIngs });
                                    }} className="w-20 bg-card" />
                                    <Input placeholder="Unit" value={ing.unit || ""} onChange={e => {
                                        const newIngs = [...editData.ingredients];
                                        newIngs[idx].unit = e.target.value;
                                        setEditData({ ...editData, ingredients: newIngs });
                                    }} className="w-24 bg-card" />
                                    <Input placeholder="Ingredient name" value={ing.name || ""} onChange={e => {
                                        const newIngs = [...editData.ingredients];
                                        newIngs[idx].name = e.target.value;
                                        setEditData({ ...editData, ingredients: newIngs });
                                    }} className="flex-1 bg-card" />
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
                                        const newIngs = editData.ingredients.filter((_: any, i: number) => i !== idx);
                                        setEditData({ ...editData, ingredients: newIngs });
                                    }}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))
                        ) : (
                            recipe.ingredients.map((ing: any, idx: number) => (
                                <label
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${checkedIngredients[idx] ? 'bg-secondary/50 border-transparent opacity-60 text-muted-foreground' : 'bg-card border-border shadow-sm'}`}
                                >
                                    <Checkbox
                                        checked={!!checkedIngredients[idx]}
                                        onCheckedChange={() => toggleIngredient(idx)}
                                    />
                                    <span className={`font-medium ${checkedIngredients[idx] ? 'line-through' : ''}`}>
                                        {ing.quantity} {ing.unit} {ing.name}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Steps */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-foreground">Steps</h2>
                        {!isEditing && (
                            <Button variant="ghost" size="sm" className="text-primary font-semibold" onClick={() => setCookingMode(true)}>
                                <Maximize2 className="w-4 h-4 mr-2" />
                                Cooking Mode
                            </Button>
                        )}
                        {isEditing && (
                            <Button variant="ghost" size="sm" onClick={() => setEditData({ ...editData, steps: [...editData.steps, ""] })}>
                                <Plus className="w-4 h-4 mr-1" /> Add Step
                            </Button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {isEditing ? (
                            editData.steps.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 mt-1 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {idx + 1}
                                    </div>
                                    <Textarea
                                        value={step}
                                        onChange={e => {
                                            const newSteps = [...editData.steps];
                                            newSteps[idx] = e.target.value;
                                            setEditData({ ...editData, steps: newSteps });
                                        }}
                                        className="flex-1 min-h-[80px] bg-card text-foreground"
                                    />
                                    <Button variant="ghost" size="icon" className="text-red-500 mt-1" onClick={() => {
                                        const newSteps = editData.steps.filter((_: any, i: number) => i !== idx);
                                        setEditData({ ...editData, steps: newSteps });
                                    }}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                            ))
                        ) : (
                            recipe.steps.map((step: string, idx: number) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                        {idx + 1}
                                    </div>
                                    <p className="pt-1 text-foreground leading-relaxed">
                                        {step}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div id="activity-feed">
                    <ActivityFeed recipeId={recipe.id} initialEntries={initialEntries} currentUser={currentUser} />
                </div>
            </div>

            {/* Fixed Action Bar */}
            <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto z-40">
                <div className="bg-card/90 backdrop-blur-xl border border-border shadow-lg rounded-full px-6 py-4 flex items-center justify-between">
                    <button
                        className={`transition-colors active:scale-90 ${isLiked ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500'}`}
                        onClick={() => setIsLiked(!isLiked)}
                    >
                        <Heart className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} />
                    </button>
                    <button
                        className={`transition-colors active:scale-90 ${isBookmarked ? 'text-primary fill-primary' : 'text-muted-foreground hover:text-primary'}`}
                        onClick={() => setIsBookmarked(!isBookmarked)}
                    >
                        <Bookmark className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} />
                    </button>
                    <MadeItModal recipeId={recipe.id}>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 font-bold shadow-sm">
                            Made it!
                        </Button>
                    </MadeItModal>
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors active:scale-90"
                        onClick={scrollToComments}
                    >
                        <MessageCircle className="w-6 h-6" />
                    </button>
                    <button
                        className="text-muted-foreground hover:text-foreground transition-colors active:scale-90"
                        onClick={handleShare}
                    >
                        <Share className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </main>
    );
}
