"use server";

import { createClient } from "@/utils/supabase/server";

export async function saveRecipe(recipeData: any) {
    const supabase = await createClient();

    // For MVP, if not logged in, we will just use a dummy user if RLS is off, but RLS is ON.
    // We MUST be logged in. 
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in to save recipes");
    }

    // Ensure user has a profile record
    const { data: profile } = await supabase.from('profiles').select('id, name').eq('id', user.id).single();

    if (!profile) {
        // Auto create profile for demo purposes if it doesn't exist
        await supabase.from('profiles').insert({
            id: user.id,
            name: user.email?.split("@")[0] || "User",
            role: 'user'
        });
    }

    const { data, error } = await supabase
        .from("recipes")
        .insert({
            title: recipeData.title,
            image_url: recipeData.image || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop",
            time: recipeData.time || 20, // add time col if needed (forgot in schema? wait, let's store in json or alter schema. Actually let's throw it in tags or add a column)
            ingredients: recipeData.ingredients || [],
            steps: recipeData.steps || [],
            ai_tags: recipeData.tags || [],
            health_score: recipeData.health_score || 5,
            categories: recipeData.tags || [],
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        console.error("Save Recipe Error:", error);
        throw new Error(error.message);
    }

    return data;
}

export async function updateRecipe(id: string, updates: any) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in to edit recipes");
    }

    const { data, error } = await supabase
        .from("recipes")
        .update({
            title: updates.title,
            time: updates.time,
            health_score: updates.health_score,
            ingredients: updates.ingredients,
            steps: updates.steps,
            categories: updates.tags
        })
        .eq("id", id)
        .eq("created_by", user.id) // Security: only creator can edit
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
