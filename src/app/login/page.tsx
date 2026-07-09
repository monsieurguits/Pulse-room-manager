import { LoginForm } from '@/components/login-form';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ contact?: string }> }) {
  const params = await searchParams;
  return (
    <main className="relative flex min-h-[calc(100svh-10rem)] items-center justify-center overflow-hidden bg-[#050509] px-4 py-8 text-neutral-100 sm:min-h-[calc(100svh-5.5rem)]">
      <div className="login-animated-gradient absolute inset-0" />
      <div className="login-ambient-glow absolute inset-0" />
      <div className="absolute inset-0 bg-[linear-gradient(165deg,rgba(5,5,9,0.18)_0%,rgba(5,5,9,0.72)_45%,rgba(5,5,9,0.94)_100%)] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-base-950 via-base-950/80 to-transparent" />
      <LoginForm contactSent={params.contact === 'sent'} />
    </main>
  );
}
