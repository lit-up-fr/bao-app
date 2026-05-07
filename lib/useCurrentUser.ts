"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getFavoris } from "@/lib/auth";

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [favorisIds, setFavorisIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const favs = await getFavoris(session.user.id);
        setFavorisIds(favs);
      }
      setLoaded(true);
    }
    init();
  }, []);

  function updateFavori(ficheId: string, isFavori: boolean) {
    setFavorisIds((prev) =>
      isFavori ? [...prev, ficheId] : prev.filter((id) => id !== ficheId)
    );
  }

  return { userId, favorisIds, updateFavori, loaded };
}
