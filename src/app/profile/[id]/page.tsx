import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: requestedUserId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const isCurrentUser = user.id === requestedUserId;

    // Fetch Profile
    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', requestedUserId)
        .single();

    // Auto-create profile if missing for current user (happens for accounts created before Phase 5 DB triggers)
    if (!profile && isCurrentUser) {
        const newProfile = {
            id: user.id,
            name: user.email?.split("@")[0] || "User",
            role: 'user'
        };
        await supabase.from('profiles').insert(newProfile);
        profile = newProfile;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
                Profile not found.
            </div>
        );
    }

    // Fetch Recipes added by user
    const { data: addedRecipes } = await supabase
        .from('recipes')
        .select('id, title, image_url, created_at')
        .eq('created_by', requestedUserId)
        .order('created_at', { ascending: false });

    // Fetch Cooked Entries (Made It!) by user
    const { data: cookedEntries } = await supabase
        .from('cooked_entries')
        .select('id, recipe_id, rating, photos, cooked_at')
        .eq('profile_id', requestedUserId)
        .order('cooked_at', { ascending: false });

    return (
        <ProfileClient
            profile={profile}
            addedRecipes={addedRecipes || []}
            cookedEntries={cookedEntries || []}
            isCurrentUser={isCurrentUser}
        />
    );
}
