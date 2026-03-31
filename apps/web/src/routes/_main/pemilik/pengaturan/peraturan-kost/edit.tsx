import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_main/pemilik/pengaturan/peraturan-kost/edit',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/pemilik/pengaturan/peraturan-kost/edit"!</div>
}
