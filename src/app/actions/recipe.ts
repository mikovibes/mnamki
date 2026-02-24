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

    // Determine image URL: Use provided image, or fallback to a category placeholder
    let imageUrl = recipeData.image;
    if (!imageUrl || imageUrl.includes("unsplash.com")) {
        const primaryCategory = recipeData.tags?.[0];
        if (primaryCategory) {
            const formattedCategory = primaryCategory.toLowerCase().replace(/\s+/g, '_');
            imageUrl = `/placeholders/${formattedCategory}.png`;
        } else {
            imageUrl = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1000&auto=format&fit=crop";
        }
    }

    const { data, error } = await supabase
        .from("recipes")
        .insert({
            title: recipeData.title,
            image_url: imageUrl,
            time: recipeData.time || 20,
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
