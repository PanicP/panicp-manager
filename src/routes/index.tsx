import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

type Recipe = { id: number; name: string }
type Workout = { id: number; name: string; exercises: unknown[] }
type Ingredient = { id: number; name: string; selected: boolean }

const useRecipes = () =>
  useQuery({
    queryKey: ['recipes', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recipes').select('id, name')
      if (error) throw error
      return data as Recipe[]
    },
  })

const useWorkouts = () =>
  useQuery({
    queryKey: ['workouts', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workouts').select('id, name, exercises')
      if (error) throw error
      return data as Workout[]
    },
  })

const useIngredients = () =>
  useQuery({
    queryKey: ['ingredients', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase.from('ingredients').select('id, name, selected')
      if (error) throw error
      return data as Ingredient[]
    },
  })

const DashboardPage = () => {
  const { data: recipes, isPending: recipesPending } = useRecipes()
  const { data: workouts, isPending: workoutsPending } = useWorkouts()
  const { data: ingredients, isPending: ingredientsPending } = useIngredients()

  const exerciseCount = workouts?.reduce((sum, w) => sum + w.exercises.length, 0) ?? 0
  const selectedCount = ingredients?.filter((i) => i.selected).length ?? 0

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1>Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/cookbook">
          <Card>
            <CardHeader>
              <CardTitle>Cookbook</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-left">
              {recipesPending ? (
                <Spinner />
              ) : (
                <>
                  <p>{recipes?.length ?? 0} recipes</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {recipes?.map((r) => r.name).join(', ') || 'No recipes yet'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/workouts">
          <Card>
            <CardHeader>
              <CardTitle>Workouts</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-left">
              {workoutsPending ? (
                <Spinner />
              ) : (
                <>
                  <p>{workouts?.length ?? 0} workouts</p>
                  <p className="text-sm text-muted-foreground">{exerciseCount} exercises total</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link to="/groceries">
          <Card>
            <CardHeader>
              <CardTitle>Groceries</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-left">
              {ingredientsPending ? (
                <Spinner />
              ) : (
                <>
                  <p>{selectedCount} picked this week</p>
                  <p className="text-sm text-muted-foreground">{ingredients?.length ?? 0} ingredients in pool</p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: DashboardPage,
})
