import { useIntroModal } from '../../session/useIntroModal';
import { IntroModalView } from './IntroModalView';

export function IntroModal() {
  const { opened, dismissIntro } = useIntroModal();

  return <IntroModalView opened={opened} onClose={dismissIntro} />;
}
