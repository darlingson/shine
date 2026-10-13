import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/matches/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/data/matches/"!</div>
}
