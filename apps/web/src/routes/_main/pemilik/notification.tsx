import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/pemilik/notification')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/pemilik/notification"!</div>
}
