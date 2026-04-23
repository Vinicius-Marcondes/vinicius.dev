import { StatusStrip } from '../../../widgets/status-strip'
import { ActionButton, Container, InlineLabel, ScreenFrame, ScreenTitle, Section, Stack } from '../../../shared/ui'

export function HomePage() {
  return (
    <Container>
      <Section>
        <ScreenFrame className="home-page__frame">
          <Stack gap={20}>
            <InlineLabel>home route</InlineLabel>
            <ScreenTitle>Signal acquired</ScreenTitle>
            <p className="page-copy">
              The runtime, public shell, and route tree are active. FE-004 will
              replace this placeholder with the migrated landing experience.
            </p>
            <div className="action-row">
              <ActionButton to="/projects">Projects</ActionButton>
              <ActionButton to="/photos">Photos</ActionButton>
              <ActionButton to="/thoughts">Thoughts</ActionButton>
            </div>
          </Stack>
        </ScreenFrame>
      </Section>
      <Section>
        <StatusStrip />
      </Section>
    </Container>
  )
}
