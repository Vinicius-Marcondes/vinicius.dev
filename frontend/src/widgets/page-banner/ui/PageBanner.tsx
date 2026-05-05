import { Container, InlineLabel, ScreenFrame, ScreenTitle, Section, Stack } from '../../../shared/ui'

type PageBannerProps = {
  label: string
  title: string
  description: string
}

export function PageBanner({ label, title, description }: PageBannerProps) {
  return (
    <Section className="page-banner">
      <Container>
        <ScreenFrame className="page-banner__frame">
          <Stack gap={12}>
            <InlineLabel>{label}</InlineLabel>
            <ScreenTitle className="fx-crt-title">{title}</ScreenTitle>
            <p className="page-copy">{description}</p>
          </Stack>
        </ScreenFrame>
      </Container>
    </Section>
  )
}
