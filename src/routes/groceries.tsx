import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CATEGORIES, groupByCategory, useIngredientPool, useAddToIngredientPool } from '@/services/ingredients'

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

const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, category }: { id: number; category: string }) => {
      const { error } = await supabase.from('ingredients').update({ category }).eq('id', id)
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
  const { data: ingredients, isPending, error } = useIngredientPool()
  const addIngredient = useAddToIngredientPool()
  const toggleIngredient = useToggleIngredient()
  const updateCategory = useUpdateCategory()
  const deleteIngredient = useDeleteIngredient()
  const [newName, setNewName] = useState('')
  const [newCategory, setNewCategory] = useState(CATEGORIES[0])

  const handleAdd = () => {
    if (!newName.trim()) return
    addIngredient.mutate([{ name: newName.trim(), category: newCategory }], { onSuccess: () => setNewName('') })
  }

  const selected = ingredients?.filter((i) => i.selected) ?? []
  const pool = ingredients ?? []

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Groceries</h1>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner /> Loading ingredients...
        </div>
      )}
      {error && <p>Error: {error.message}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>This week's list</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selected.length === 0 && <p className="text-sm text-muted-foreground">Nothing picked yet.</p>}
            {groupByCategory(selected).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">{category}</p>
                {items.map((ingredient) => (
                  <label key={ingredient.id} className="flex items-center gap-2">
                    {toggleIngredient.isPending && toggleIngredient.variables?.id === ingredient.id ? (
                      <Spinner />
                    ) : (
                      <Checkbox
                        checked={ingredient.selected}
                        onCheckedChange={(checked) =>
                          toggleIngredient.mutate({ id: ingredient.id, selected: checked === true })
                        }
                      />
                    )}
                    {ingredient.name}
                  </label>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All ingredients</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Add ingredient"
              />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={addIngredient.isPending}>
                {addIngredient.isPending ? <Spinner /> : <Plus />}
              </Button>
            </div>

            {groupByCategory(pool).map(([category, items]) => (
              <div key={category} className="flex flex-col gap-2">
                <p className="text-sm font-medium text-muted-foreground">{category}</p>
                {items.map((ingredient) => (
                  <div key={ingredient.id} className="flex items-center gap-2">
                    <label className="flex flex-1 items-center gap-2">
                      {toggleIngredient.isPending && toggleIngredient.variables?.id === ingredient.id ? (
                        <Spinner />
                      ) : (
                        <Checkbox
                          checked={ingredient.selected}
                          onCheckedChange={(checked) =>
                            toggleIngredient.mutate({ id: ingredient.id, selected: checked === true })
                          }
                        />
                      )}
                      {ingredient.name}
                    </label>
                    <Select
                      value={ingredient.category}
                      onValueChange={(category) => updateCategory.mutate({ id: ingredient.id, category })}
                    >
                      <SelectTrigger size="sm" className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteIngredient.mutate(ingredient.id)}
                      disabled={deleteIngredient.isPending && deleteIngredient.variables === ingredient.id}
                    >
                      {deleteIngredient.isPending && deleteIngredient.variables === ingredient.id ? (
                        <Spinner />
                      ) : (
                        <Trash2 />
                      )}
                    </Button>
                  </div>
                ))}
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
