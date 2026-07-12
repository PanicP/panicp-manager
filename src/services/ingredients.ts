import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/supabaseClient'

export type PoolIngredient = { id: number; name: string; selected: boolean; category: string }

export const CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Meat',
  'Grains',
  'Snacks',
  'Sauces',
  'Frozen',
  'Bakery',
  'Beverages',
  'Spices',
  'Other',
]

export const useIngredientPool = () =>
  useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ingredients').select('*').order('category').order('name')
      if (error) throw error
      return data as PoolIngredient[]
    },
  })

export const useAddToIngredientPool = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (items: { name: string; category: string }[]) => {
      if (items.length === 0) return
      const { error } = await supabase
        .from('ingredients')
        .upsert(items.map((item) => ({ ...item, selected: false })), { onConflict: 'name', ignoreDuplicates: true })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

export const groupByCategory = <T extends { category: string }>(items: T[]) => {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const group = groups.get(item.category) ?? []
    group.push(item)
    groups.set(item.category, group)
  }
  return [...groups.entries()]
}
