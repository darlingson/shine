import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/players/$playerId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { playerId } = Route.useParams()
  return <div>Hello "/data/players/{playerId}"!</div>
}
