import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/member/notifikasi/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/member/notifikasi/"!</div>
}
