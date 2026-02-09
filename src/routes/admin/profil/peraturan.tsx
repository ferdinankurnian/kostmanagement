import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/profil/peraturan')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/profil/peraturan"!</div>
}
