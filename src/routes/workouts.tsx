import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/supabaseClient'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Exercise = { name: string; weight: string; sets: string; reps: string }
type Workout = { id: number; name: string; exercises: Exercise[] }

const emptyExercise: Exercise = { name: '', weight: '', sets: '', reps: '' }

const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('workouts').select('*').order('created_at')
      if (error) throw error
      return data as Workout[]
    },
  })
}

const useSaveWorkout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (workout: Omit<Workout, 'id'> & { id?: number }) => {
      const { error } = await supabase.from('workouts').upsert(workout)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  })
}

const useDeleteWorkout = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('workouts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workouts'] }),
  })
}

const WorkoutCard = ({ workout }: { workout: Workout }) => {
  const saveWorkout = useSaveWorkout()
  const deleteWorkout = useDeleteWorkout()
  const [name, setName] = useState(workout.name)
  const [exercises, setExercises] = useState(workout.exercises)

  const updateExercise = (index: number, field: keyof Exercise, value: string) =>
    setExercises(exercises.map((exercise, i) => (i === index ? { ...exercise, [field]: value } : exercise)))

  const addExercise = () => setExercises([...exercises, { ...emptyExercise }])

  const removeExercise = (index: number) => setExercises(exercises.filter((_, i) => i !== index))

  const save = () => saveWorkout.mutate({ id: workout.id, name, exercises })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Input value={name} onChange={(e) => setName(e.target.value)} onBlur={save} placeholder="Workout name" />
        </CardTitle>
        <CardAction>
          <Button variant="ghost" size="icon-sm" onClick={() => deleteWorkout.mutate(workout.id)}>
            <Trash2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_5rem_4rem_4rem_auto] gap-2 text-sm text-muted-foreground">
          <span>Exercise</span>
          <span>Weight</span>
          <span>Sets</span>
          <span>Reps</span>
          <span />
        </div>
        {exercises.map((exercise, index) => (
          <div key={index} className="grid grid-cols-[1fr_5rem_4rem_4rem_auto] gap-2">
            <Input
              value={exercise.name}
              onChange={(e) => updateExercise(index, 'name', e.target.value)}
              onBlur={save}
              placeholder="Exercise"
            />
            <Input
              value={exercise.weight}
              onChange={(e) => updateExercise(index, 'weight', e.target.value)}
              onBlur={save}
              placeholder="lbs"
            />
            <Input
              value={exercise.sets}
              onChange={(e) => updateExercise(index, 'sets', e.target.value)}
              onBlur={save}
              placeholder="Sets"
            />
            <Input
              value={exercise.reps}
              onChange={(e) => updateExercise(index, 'reps', e.target.value)}
              onBlur={save}
              placeholder="Reps"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                removeExercise(index)
                saveWorkout.mutate({ id: workout.id, name, exercises: exercises.filter((_, i) => i !== index) })
              }}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addExercise}>
          <Plus /> Add exercise
        </Button>
      </CardContent>
    </Card>
  )
}

const WorkoutsPage = () => {
  const { data: workouts, isPending, error } = useWorkouts()
  const saveWorkout = useSaveWorkout()

  const addWorkout = () =>
    saveWorkout.mutate({ name: 'New workout', exercises: [{ ...emptyExercise }] })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1>Workouts</h1>
        <Button onClick={addWorkout}>
          <Plus /> New workout
        </Button>
      </div>

      {isPending && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {workouts?.map((workout) => (
          <WorkoutCard key={workout.id} workout={workout} />
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute('/workouts')({
  component: WorkoutsPage,
})
