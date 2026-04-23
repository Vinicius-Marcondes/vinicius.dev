import { PageBanner } from '../../../../widgets/page-banner'
import { ActionButton, Container, ScreenFrame, Section, Stack } from '../../../../shared/ui'

export function ChatRoomPage() {
  return (
    <Container>
      <PageBanner
        label="chat room"
        title="Room route scaffold"
        description="FE-008 owns the password gate, room timeline, and message composition UI."
      />
      <Section>
        <ScreenFrame>
          <Stack gap={16}>
            <p className="page-copy">
              This route exists so the public navigation and route tree are
              complete before chat-specific widgets arrive.
            </p>
            <ActionButton to="/admin/login">Admin login route</ActionButton>
          </Stack>
        </ScreenFrame>
      </Section>
    </Container>
  )
}
