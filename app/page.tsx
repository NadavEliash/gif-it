import Link from "next/link";

export default function Home() {
  const pages = [
    {
      href: '/landing',
      title: 'Landing'
    },
    {
      href: '/record',
      title: 'Record'
    },
    {
      href: '/events',
      title: 'Events'
    },
  ]
  return (
    <main>
      <nav className="p-8 flex gap-4 text-xl">
        {pages.map(page =>
          <Link href={page.href}>{page.title}</Link>
        )}
        <Link href={'/'} className="ml-auto text-2xl font-black">GIF-IT</Link>
      </nav>
      <h1 className="mt-20 text-center text-8xl font-bold">
        Welcome back!
      </h1>
    </main>
  )
}