import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'

type Ingredient = { id: number; name: string; selected: boolean }

const useIngredients = () => {
  return useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ingredients').select('*').order('name')
      if (error) throw error
      return data as Ingredient[]
    },
  })
}

const useAddIngredient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from('ingredients').insert({ name, selected: false })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

const useToggleIngredient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, selected }: { id: number; selected: boolean }) => {
      const { error } = await supabase.from('ingredients').update({ selected }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

const useDeleteIngredient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('ingredients').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ingredients'] }),
  })
}

const GroceriesPage = () => {
  const { data: ingredients, isPending, error } = useIngredients()
  const addIngredient = useAddIngredient()
  const toggleIngredient = useToggleIngredient()
  const deleteIngredient = useDeleteIngredient()
  const [newName, setNewName] = useState('')

  const handleAdd = () => {
    if (!newName.trim()) return
    addIngredient.mutate(newName.trim(), { onSuccess: () => setNewName('') })
  }

  const selected = ingredients?.filter((i) => i.selected) ?? []
  const pool = ingredients ?? []

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Groceries</h1>

      {isPending && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This week's list</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {selected.length === 0 && <p className="text-sm text-muted-foreground">Nothing picked yet.</p>}
            {selected.map((ingredient) => (
              <label key={ingredient.id} className="flex items-center gap-2">
                <Checkbox
                  checked={ingredient.selected}
                  onCheckedChange={(checked) =>
                    toggleIngredient.mutate({ id: ingredient.id, selected: checked === true })
                  }
                />
                {ingredient.name}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All ingredients</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add ingredient"
              />
              <Button onClick={handleAdd}>
                <Plus />
              </Button>
            </div>
            {pool.map((ingredient) => (
              <div key={ingredient.id} className="flex items-center gap-2">
                <label className="flex flex-1 items-center gap-2">
                  <Checkbox
                    checked={ingredient.selected}
                    onCheckedChange={(checked) =>
                      toggleIngredient.mutate({ id: ingredient.id, selected: checked === true })
                    }
                  />
                  {ingredient.name}
                </label>
                <Button variant="ghost" size="icon-sm" onClick={() => deleteIngredient.mutate(ingredient.id)}>
                  <Trash2 />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/groceries')({
  component: GroceriesPage,
})
