import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/profil/rekening')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/profil/rekening"!</div>
}
