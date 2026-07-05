import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/supabaseClient'

// Swap 'todos' for a real table name in your Supabase project.
type Todo = { id: number; title: string; done: boolean }

const useTodos = () => {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('todos').select('*').order('id')
      if (error) throw error
      return data as Todo[]
    },
  })
}

const useAddTodo = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => {
      const { error } = await supabase.from('todos').insert({ title, done: false })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

const AuthExample = () => {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (!error) setSent(true)
  }

  return sent ? (
    <p>Check your email for the login link.</p>
  ) : (
    <form onSubmit={signIn}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" />
      <button type="submit">Send magic link</button>
    </form>
  )
}

const ExamplesPage = () => {
  const { data: todos, isPending, error } = useTodos()
  const addTodo = useAddTodo()
  const [title, setTitle] = useState('')

  return (
    <div>
      <h1>Examples</h1>

      <section>
        <h2>Read (useQuery)</h2>
        {isPending && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        <ul>
          {todos?.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Insert (useMutation)</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!title.trim()) return
            addTodo.mutate(title, { onSuccess: () => setTitle('') })
          }}
        >
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New todo" />
          <button type="submit" disabled={addTodo.isPending}>
            Add
          </button>
        </form>
      </section>

      <section>
        <h2>Auth (email magic link)</h2>
        <AuthExample />
      </section>
    </div>
  )
}

export const Route = createFileRoute('/examples')({
  component: ExamplesPage,
})
