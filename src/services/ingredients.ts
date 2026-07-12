import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/supabaseClient'

export type PoolIngredient = { id: number; name: string; selected: boolean }

export const useIngredientPool = () =>
  useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ingredients').select('*').order('name')
      if (error) throw error
      return data as PoolIngredient[]
    },
  })

export const useAddToIngredientPool = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (names: string[]) => {
      if (names.length === 0) return
      const rows = names.map((name) => ({ name, selected: false }))
      const { error } = await supabase
        .from('ingredients')
        .upsert(rows, { onConflict: 'name', ignoreDuplicates: true })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}
