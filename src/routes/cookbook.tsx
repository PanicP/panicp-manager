import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { useIngredientPool } from '@/services/ingredients'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Ingredient = { name: string; amount: string; unit: string }
type Recipe = { id: number; name: string; ingredients: Ingredient[] }
type RecipeForm = { id: number | null; name: string; ingredients: Ingredient[] }

const emptyForm: RecipeForm = { id: null, name: '', ingredients: [{ name: '', amount: '', unit: '' }] }

const useRecipes = () => {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recipes').select('*').order('created_at')
      if (error) throw error
      return data as Recipe[]
    },
  })
}

const useSaveRecipe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (recipe: RecipeForm) => {
      const payload = { name: recipe.name, ingredients: recipe.ingredients }
      const { error } = recipe.id
        ? await supabase.from('recipes').update(payload).eq('id', recipe.id)
        : await supabase.from('recipes').insert(payload)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

const useDeleteRecipe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('recipes').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
  })
}

const RecipeFormFields = ({
  form,
  setForm,
  poolNames,
}: {
  form: RecipeForm
  setForm: (form: RecipeForm) => void
  poolNames: string[]
}) => {
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const ingredients = form.ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient,
    )
    setForm({ ...form, ingredients })
  }

  const addIngredient = () =>
    setForm({ ...form, ingredients: [...form.ingredients, { name: '', amount: '', unit: '' }] })

  const removeIngredient = (index: number) =>
    setForm({ ...form, ingredients: form.ingredients.filter((_, i) => i !== index) })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recipe-name">Name</Label>
        <Input
          id="recipe-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. หมูผัดเต้าเจี้ยว"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Ingredients</Label>
        {form.ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2">
            <Select value={ingredient.name} onValueChange={(value) => updateIngredient(index, 'name', value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Ingredient" />
              </SelectTrigger>
              <SelectContent>
                {poolNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={ingredient.amount}
              onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
              placeholder="Amount"
              className="w-32"
            />
            <Input
              value={ingredient.unit}
              onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
              placeholder="Unit"
              className="w-40"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeIngredient(index)}
              disabled={form.ingredients.length === 1}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
          <Plus /> Add ingredient
        </Button>
      </div>
    </div>
  )
}

const CookbookPage = () => {
  const { data: recipes, isPending, error } = useRecipes()
  const { data: pool } = useIngredientPool()
  const saveRecipe = useSaveRecipe()
  const deleteRecipe = useDeleteRecipe()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<RecipeForm>(emptyForm)
  const poolNames = pool?.map((i) => i.name) ?? []

  const openNew = () => {
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (recipe: Recipe) => {
    setForm({ id: recipe.id, name: recipe.name, ingredients: recipe.ingredients })
    setOpen(true)
  }

  const handleSave = () => {
    const ingredients = form.ingredients.filter((ingredient) => ingredient.name.trim())
    saveRecipe.mutate({ ...form, ingredients }, { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1>Cookbook</h1>
        <Button onClick={openNew}>
          <Plus /> New recipe
        </Button>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner /> Loading recipes...
        </div>
      )}
      {error && <p>Error: {error.message}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recipes?.map((recipe) => (
          <Card key={recipe.id}>
            <CardHeader>
              <CardTitle>{recipe.name}</CardTitle>
              <CardAction className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(recipe)}>
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteRecipe.mutate(recipe.id)}
                  disabled={deleteRecipe.isPending && deleteRecipe.variables === recipe.id}
                >
                  {deleteRecipe.isPending && deleteRecipe.variables === recipe.id ? <Spinner /> : <Trash2 />}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-left">
              {recipe.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span>{ingredient.name}</span>
                  <Badge variant="outline">
                    {ingredient.amount} {ingredient.unit}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85vh] flex-col overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit recipe' : 'New recipe'}</DialogTitle>
          </DialogHeader>
          <RecipeFormFields form={form} setForm={setForm} poolNames={poolNames} />
          <DialogFooter>
            <Button onClick={handleSave} disabled={!form.name.trim() || saveRecipe.isPending}>
              {saveRecipe.isPending && <Spinner />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute('/cookbook')({
  component: CookbookPage,
})
