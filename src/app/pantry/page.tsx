import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Plus, Search, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PantryClient } from "./pantry-client";

export default async function PantryPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch pantry items
    const { data: pantryItems } = await supabase
        .from("pantry_items")
        .select("*")
        .order("name", { ascending: true });

    return <PantryClient initialItems={pantryItems || []} userId={user.id} />;
}
