import { ActionButton, InlineLabel, Stack } from '../../../../shared/ui'

export function AdminLoginPage() {
  return (
    <Stack gap={16}>
      <InlineLabel>admin login</InlineLabel>
      <h2 className="page-heading">Login route scaffold</h2>
      <p className="page-copy">
        FE-009 will replace this placeholder with the actual admin entry
        surface and dashboard flow.
      </p>
      <ActionButton to="/admin/dashboard">Open dashboard stub</ActionButton>
    </Stack>
  )
}
