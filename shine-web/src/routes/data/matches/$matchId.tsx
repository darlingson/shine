import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/matches/$matchId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { matchId } = Route.useParams()
  return <div>Hello "/data/matches/{matchId}"!</div>
}
