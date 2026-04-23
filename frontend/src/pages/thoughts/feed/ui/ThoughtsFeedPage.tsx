import { PageBanner } from '../../../../widgets/page-banner'
import { ActionButton, Container, ScreenFrame, Section, Stack } from '../../../../shared/ui'

export function ThoughtsFeedPage() {
  return (
    <Container>
      <PageBanner
        label="thoughts"
        title="Feed route placeholder"
        description="FE-007 will design and populate the public thoughts feed."
      />
      <Section>
        <ScreenFrame>
          <Stack gap={16}>
            <p className="page-copy">
              This stub exists so the public route tree is complete before the
              real thoughts screen lands.
            </p>
            <ActionButton to="/">Back to signal</ActionButton>
          </Stack>
        </ScreenFrame>
      </Section>
    </Container>
  )
}
