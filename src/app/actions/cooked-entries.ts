"use server";

import { createClient } from "@/utils/supabase/server";

export async function saveCookedEntry(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Not authenticated" };
    }

    const recipeId = formData.get("recipeId") as string;
    const rating = parseInt(formData.get("rating") as string, 10);
    const note = formData.get("note") as string;
    const photo = formData.get("photo") as File | null;

    let photoUrl = "";

    if (photo && photo.size > 0) {
        const fileExt = photo.name.split('.').pop() || 'jpg';
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${user.id}/${recipeId}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("recipe-photos").upload(filePath, photo);
        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage.from("recipe-photos").getPublicUrl(filePath);
            photoUrl = publicUrl;
        } else {
            console.error("Upload error:", uploadError);
        }
    }

    const { error } = await supabase.from("cooked_entries").insert({
        recipe_id: recipeId,
        profile_id: user.id,
        rating,
        notes: note,
        photos: photoUrl ? [photoUrl] : [],
    });

    if (error) {
        console.error("Save cooked entry error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
