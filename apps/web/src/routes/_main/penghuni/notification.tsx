import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/penghuni/notification')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_main/penghuni/notification"!</div>
}
