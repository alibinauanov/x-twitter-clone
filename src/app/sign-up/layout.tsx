export const metadata = {
  title: 'Sign Up - X Twitter Clone',
  description: 'Create your X Twitter Clone account',
}

export default function SignUpLayout({
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
