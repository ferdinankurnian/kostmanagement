import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/member/keluhan/detail')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/member/keluhan/detail"!</div>
}
