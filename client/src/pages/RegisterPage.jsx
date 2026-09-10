import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { UserPlus } from '../components/ui/icons.jsx'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import Panel from '../components/ui/Panel.jsx'
import { useToast } from '../components/ui/toastContext.js'
import { register } from '../features/auth/api.js'
import { setCredentials } from '../features/auth/authSlice.js'

const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().trim().email('Enter a valid email address'),
  password: z
    .string()
    .regex(passwordPattern, 'Use 8+ characters with upper, lower, number, and special character'),
})

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: '', email: '', password: '' } })
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (session) => {
      dispatch(setCredentials(session))
      navigate('/app', { replace: true })
    },
    onError: (error) => showToast({ tone: 'error', title: 'Could not create account', message: error.message }),
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-50 px-4 py-10">
      <Panel className="w-full max-w-md p-6">
        <div className="mb-6">
          <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-600 font-bold text-white">
            TM
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Start organizing work with boards, lists, and cards.</p>
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Name" error={form.formState.errors.name?.message}>
            <Input autoComplete="name" {...form.register('name')} />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="email" {...form.register('email')} />
          </Field>
          <Field label="Password" hint="Minimum 8 characters with uppercase, lowercase, digit, and special character." error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="new-password" {...form.register('password')} />
          </Field>
          <Button className="w-full" type="submit" loading={mutation.isPending}>
            <UserPlus className="h-4 w-4" /> Create account
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link className="font-medium text-accent-700 hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </Panel>
    </main>
  )
}
