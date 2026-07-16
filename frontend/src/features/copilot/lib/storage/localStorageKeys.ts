export const PA_STORAGE_PREFIX = 'pa-copilot' as const;

export const PA_STORAGE_KEYS = {
  settings: `${PA_STORAGE_PREFIX}-settings`,
  conversations: `${PA_STORAGE_PREFIX}-conversations-v2`,
  introSeen: `${PA_STORAGE_PREFIX}-intro-seen`,
} as const;
