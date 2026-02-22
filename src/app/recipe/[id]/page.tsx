import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { RecipeClient } from "./recipe-client";

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: recipe } = await supabase
        .from("recipes")
        .select("*, profiles!recipes_created_by_fkey(name)")
        .eq("id", id)
        .single();

    if (!recipe) {
        notFound();
    }

    const { data: cookedEntries } = await supabase
        .from("cooked_entries")
        .select("*, profiles(name)")
        .eq("recipe_id", id);

    const { data: comments } = await supabase
        .from("comments")
        .select("*, profiles(name)")
        .eq("recipe_id", id);

    const allEntries = [
        ...(cookedEntries || []).map(e => ({ ...e, type: 'cooked_entry' })),
        ...(comments || []).map(c => ({ ...c, type: 'comment' }))
    ].sort((a, b) => new Date(b.created_at || b.cooked_at).getTime() - new Date(a.created_at || a.cooked_at).getTime());

    const formattedRecipe = {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url || "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop",
        creator: recipe.profiles?.name || "Someone",
        creator_id: recipe.created_by,
        health_score: recipe.health_score || 5,
        time: recipe.time ? `${recipe.time}m` : "20m",
        servings: 2,
        tags: recipe.categories || [],
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || []
    };

    return <RecipeClient recipe={formattedRecipe} initialEntries={allEntries} currentUser={user} />;
}
