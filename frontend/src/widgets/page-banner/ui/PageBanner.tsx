import { Container, InlineLabel, ScreenFrame, ScreenTitle, Section, Stack } from '../../../shared/ui'

type PageBannerProps = {
  label: string
  title: string
  description: string
}

export function PageBanner({ label, title, description }: PageBannerProps) {
  return (
    <Section>
      <Container>
        <ScreenFrame>
          <Stack gap={12}>
            <InlineLabel>{label}</InlineLabel>
            <ScreenTitle>{title}</ScreenTitle>
            <p className="page-copy">{description}</p>
          </Stack>
        </ScreenFrame>
      </Container>
    </Section>
  )
}
