'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

const STANDALONE_QUERY = '(display-mode: standalone)';

function subscribeDisplayMode(onChange: () => void) {
  const query = window.matchMedia(STANDALONE_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const isStandalone = () => window.matchMedia(STANDALONE_QUERY).matches;

/**
 * Chromium only fires `beforeinstallprompt` on secure origins. On plain HTTP
 * `canPrompt` stays false and users install from the browser menu instead.
 */
export function useInstallApp() {
  const standalone = useSyncExternalStore(subscribeDisplayMode, isStandalone, () => false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setJustInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) {
      return false;
    }
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    return outcome === 'accepted';
  }, [promptEvent]);

  return { installed: standalone || justInstalled, canPrompt: promptEvent !== null, install };
}
