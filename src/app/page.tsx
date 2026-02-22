import { MagicAdd } from "@/components/recipe/magic-add";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingListGenerator } from "@/components/shopping/list-generator";
import { RecipeGrid } from "@/components/recipe/recipe-grid";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch recent recipes from DB (include categories for filtering)
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, title, time, image_url, health_score, categories, ingredients")
    .order("created_at", { ascending: false });

  // Fetch pantry items for Shopping List Generation
  const { data: pantryItems } = await supabase
    .from("pantry_items")
    .select("name, quantity, unit");

  // Fetch all profiles for Social Story Bubbles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name");

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-10 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manamki</h1>
            <p className="text-sm font-medium text-healthy">Our recipes, made smarter.</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/profile/${user.id}`}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 flex flex-col items-center justify-center text-primary shadow-inner cursor-pointer hover:bg-primary/20 transition-all border border-primary/20">
                <span className="text-sm font-bold uppercase leading-none drop-shadow-sm">
                  {user.email?.[0] || "U"}
                </span>
              </div>
            </Link>
            <Link href="/pantry">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary shadow-inner cursor-pointer hover:bg-primary/30 transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5">Pantry</span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 space-y-8 mt-6">

        {/* Social Story Bubbles */}
        <section className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6">
          {profiles?.map(p => (
            <Link key={p.id} href={`/profile/${p.id}`} className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer active:scale-95 transition-transform">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-orange-500 to-primary shadow-sm">
                <div className="w-full h-full rounded-full border-[2.5px] border-background bg-card flex items-center justify-center overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-xl group-hover:scale-110 transition-transform">
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-foreground max-w-[64px] truncate text-center -tracking-tighter">
                {p.id === user.id ? 'You' : p.name}
              </span>
            </Link>
          ))}
        </section>

        <section>
          <ShoppingListGenerator recipes={recipes || []} pantryItems={pantryItems || []} />
        </section>

        <section>
          <MagicAdd />
        </section>

        <section>
          <RecipeGrid recipes={recipes?.map(r => ({ ...r, tags: r.categories })) || []} />
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </main>
  );
}
