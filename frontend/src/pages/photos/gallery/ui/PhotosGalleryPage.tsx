import { PageBanner } from '../../../../widgets/page-banner'
import { Container, InlineLabel, ScreenFrame, Section, Stack } from '../../../../shared/ui'

export function PhotosGalleryPage() {
  return (
    <Container>
      <PageBanner
        label="photos"
        title="Gallery route scaffold"
        description="FE-006 owns the migrated photo gallery, controls, and lightbox behavior."
      />
      <Section>
        <ScreenFrame>
          <Stack gap={12}>
            <InlineLabel>photos gallery</InlineLabel>
            <p className="page-copy">
              The route and safelight-ready theme hook are in place. FE-006 will
              replace this placeholder with the actual gallery composition.
            </p>
          </Stack>
        </ScreenFrame>
      </Section>
    </Container>
  )
}
