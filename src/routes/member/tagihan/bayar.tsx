import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/member/tagihan/bayar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/member/tagihan/bayar"!</div>
}
