import { InlineLabel, ScreenFrame, Stack } from '../../../../shared/ui'

export function AdminDashboardPage() {
  return (
    <Stack gap={16}>
      <InlineLabel>admin dashboard</InlineLabel>
      <h2 className="page-heading">Dashboard route scaffold</h2>
      <div className="dashboard-grid">
        <ScreenFrame>
          <p className="page-copy">Content curation panel placeholder.</p>
        </ScreenFrame>
        <ScreenFrame>
          <p className="page-copy">Status strip controls placeholder.</p>
        </ScreenFrame>
        <ScreenFrame>
          <p className="page-copy">Moderation queue placeholder.</p>
        </ScreenFrame>
      </div>
    </Stack>
  )
}
