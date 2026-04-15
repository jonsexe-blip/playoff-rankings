import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Sign In</h1>
          <p className="text-muted-foreground">
            Enter your email to join the 2025-26 Playoff Predictor.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
