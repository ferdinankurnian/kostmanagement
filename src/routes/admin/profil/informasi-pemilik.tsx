import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/profil/informasi-pemilik')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/profil/informasi-pemilik"!</div>
}
