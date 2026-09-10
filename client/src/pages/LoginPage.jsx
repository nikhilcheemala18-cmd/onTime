import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { LogIn } from '../components/ui/icons.jsx'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import Panel from '../components/ui/Panel.jsx'
import { useToast } from '../components/ui/toastContext.js'
import { login, register } from '../features/auth/api.js'
import { setCredentials } from '../features/auth/authSlice.js'

const DEMO_CREDENTIALS = {
  name: 'Preview User',
  email: 'preview@example.com',
  password: 'Preview123!',
}

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const from = location.state?.from?.pathname || '/app'
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } })
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      dispatch(setCredentials(session))
      navigate(from, { replace: true })
    },
    onError: (error) => showToast({ tone: 'error', title: 'Could not sign in', message: error.message }),
  })
  const demoMutation = useMutation({
    mutationFn: async () => {
      try {
        return await login({
          email: DEMO_CREDENTIALS.email,
          password: DEMO_CREDENTIALS.password,
        })
      } catch (error) {
        if (error.status !== 401) throw error
        return register(DEMO_CREDENTIALS)
      }
    },
    onSuccess: (session) => {
      dispatch(setCredentials(session))
      navigate(from, { replace: true })
    },
    onError: (error) => showToast({ tone: 'error', title: 'Preview login failed', message: error.message }),
  })

  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-50 px-4 py-10">
      <Panel className="w-full max-w-md p-6">
        <div className="mb-6">
          <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent-600 font-bold text-white">
            TM
          </div>
          <h1 className="text-2xl font-semibold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to your workspaces and boards.</p>
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <Input type="email" autoComplete="email" {...form.register('email')} />
          </Field>
          <Field label="Password" error={form.formState.errors.password?.message}>
            <Input type="password" autoComplete="current-password" {...form.register('password')} />
          </Field>
          <Button className="w-full" type="submit" loading={mutation.isPending}>
            <LogIn className="h-4 w-4" /> Sign in
          </Button>
        </form>
        <div className="mt-5 rounded-lg border border-accent-100 bg-accent-50 p-3">
          <p className="text-sm font-semibold text-ink-900">Preview account</p>
          <p className="mt-1 text-xs text-ink-500">Temporary hardcoded credentials for UI preview.</p>
          <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs text-ink-700">
            <p>Email: {DEMO_CREDENTIALS.email}</p>
            <p>Password: {DEMO_CREDENTIALS.password}</p>
          </div>
          <Button className="mt-3 w-full" variant="secondary" onClick={() => demoMutation.mutate()} loading={demoMutation.isPending}>
            Use preview account
          </Button>
        </div>
        <p className="mt-5 text-center text-sm text-ink-500">
          New here?{' '}
          <Link className="font-medium text-accent-700 hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </Panel>
    </main>
  )
}
