import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/profil/informasi-kost')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/profil/informasi-kost"!</div>
}
