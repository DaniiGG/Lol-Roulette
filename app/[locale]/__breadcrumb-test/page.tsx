import Breadcrumbs from '@/components/Breadcrumbs'

export default function BreadcrumbTestPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { label: 'League Roulette', href: '/' },
          { label: 'Test' },
        ]}
      />
    </main>
  )
}
