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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Exercise = { name: string; weight: string; sets: string; reps: string }
type Workout = { id: number; name: string; exercises: Exercise[] }
type WorkoutForm = { id: number | null; name: string; exercises: Exercise[] }

const emptyForm: WorkoutForm = {
  id: null,
  name: '',
  exercises: [{ name: '', weight: '', sets: '', reps: '' }],
}

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
    mutationFn: async (workout: WorkoutForm) => {
      const payload = { name: workout.name, exercises: workout.exercises }
      const { error } = workout.id
        ? await supabase.from('workouts').update(payload).eq('id', workout.id)
        : await supabase.from('workouts').insert(payload)
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

const WorkoutFormFields = ({ form, setForm }: { form: WorkoutForm; setForm: (form: WorkoutForm) => void }) => {
  const updateExercise = (index: number, field: keyof Exercise, value: string) => {
    const exercises = form.exercises.map((exercise, i) =>
      i === index ? { ...exercise, [field]: value } : exercise,
    )
    setForm({ ...form, exercises })
  }

  const addExercise = () =>
    setForm({ ...form, exercises: [...form.exercises, { name: '', weight: '', sets: '', reps: '' }] })

  const removeExercise = (index: number) =>
    setForm({ ...form, exercises: form.exercises.filter((_, i) => i !== index) })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="workout-name">Name</Label>
        <Input
          id="workout-name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Push Day"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Exercises</Label>
        {form.exercises.map((exercise, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={exercise.name}
              onChange={(e) => updateExercise(index, 'name', e.target.value)}
              placeholder="Exercise"
            />
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              value={exercise.weight}
              onChange={(e) => updateExercise(index, 'weight', e.target.value)}
              placeholder="kg"
              className="w-28"
            />
            <Input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={exercise.sets}
              onChange={(e) => updateExercise(index, 'sets', e.target.value)}
              placeholder="Sets"
              className="w-24"
            />
            <Input
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              value={exercise.reps}
              onChange={(e) => updateExercise(index, 'reps', e.target.value)}
              placeholder="Reps"
              className="w-24"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => removeExercise(index)}
              disabled={form.exercises.length === 1}
            >
              <X />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addExercise}>
          <Plus /> Add exercise
        </Button>
      </div>
    </div>
  )
}

const WorkoutsPage = () => {
  const { data: workouts, isPending, error } = useWorkouts()
  const saveWorkout = useSaveWorkout()
  const deleteWorkout = useDeleteWorkout()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<WorkoutForm>(emptyForm)

  const openNew = () => {
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (workout: Workout) => {
    setForm({ id: workout.id, name: workout.name, exercises: workout.exercises })
    setOpen(true)
  }

  const handleSave = () => {
    const exercises = form.exercises.filter((exercise) => exercise.name.trim())
    saveWorkout.mutate({ ...form, exercises }, { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1>Workouts</h1>
        <Button onClick={openNew}>
          <Plus /> New workout
        </Button>
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Spinner /> Loading workouts...
        </div>
      )}
      {error && <p>Error: {error.message}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workouts?.map((workout) => (
          <Card key={workout.id}>
            <CardHeader>
              <CardTitle>{workout.name}</CardTitle>
              <CardAction className="flex gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(workout)}>
                  <Pencil />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => deleteWorkout.mutate(workout.id)}
                  disabled={deleteWorkout.isPending && deleteWorkout.variables === workout.id}
                >
                  {deleteWorkout.isPending && deleteWorkout.variables === workout.id ? <Spinner /> : <Trash2 />}
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-left">
              {workout.exercises.map((exercise, index) => (
                <div key={index} className="flex items-center justify-between gap-2">
                  <span>{exercise.name}</span>
                  <Badge variant="outline">
                    {exercise.weight}kg · {exercise.sets}x{exercise.reps}
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
            <DialogTitle>{form.id ? 'Edit workout' : 'New workout'}</DialogTitle>
          </DialogHeader>
          <WorkoutFormFields form={form} setForm={setForm} />
          <DialogFooter>
            <Button onClick={handleSave} disabled={!form.name.trim() || saveWorkout.isPending}>
              {saveWorkout.isPending && <Spinner />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute('/workouts')({
  component: WorkoutsPage,
})
