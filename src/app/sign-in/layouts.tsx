export const metadata = {
  title: 'Sign In - X Twitter Clone',
  description: 'Sign in to your X Twitter Clone account',
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}