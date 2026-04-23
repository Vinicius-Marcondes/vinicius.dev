import { PageBanner } from '../../../../widgets/page-banner'
import { Container, InlineLabel, ScreenFrame, Section, Stack } from '../../../../shared/ui'

export function ProjectsCatalogPage() {
  return (
    <Container>
      <PageBanner
        label="projects"
        title="Catalog route scaffold"
        description="FE-005 owns the migrated project cards, controls, and catalog behavior."
      />
      <Section>
        <ScreenFrame>
          <Stack gap={12}>
            <InlineLabel>projects catalog</InlineLabel>
            <p className="page-copy">
              Route, banner, and shell ownership are in place. Project entity
              contracts and filter defaults are ready for the next task.
            </p>
          </Stack>
        </ScreenFrame>
      </Section>
    </Container>
  )
}
