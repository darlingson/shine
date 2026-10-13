import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/data/clubs/$clubId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { clubId } = Route.useParams()
  return <div>Hello "/data/clubs/{clubId}"!</div>
}
