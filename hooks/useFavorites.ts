import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('favorites')
        .select('card_id');
      if (data) {
        setFavoriteIds(new Set(data.map((f) => f.card_id)));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  const toggleFavorite = useCallback(async (cardId: string) => {
    const { data: session } = await supabase.auth.getSession();
    const userId = session.session?.user.id;

    if (favoriteIds.has(cardId)) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
      if (userId) {
        await supabase
          .from('favorites')
          .delete()
          .eq('card_id', cardId)
          .eq('user_id', userId);
      }
    } else {
      setFavoriteIds((prev) => new Set([...prev, cardId]));
      if (userId) {
        await supabase
          .from('favorites')
          .insert({ card_id: cardId, user_id: userId });
      }
    }
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite, loading };
}
