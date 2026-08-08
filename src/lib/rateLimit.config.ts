export const RATE_LIMITS = {
  chat:      { requests: 10, window: "1 m", key: "chat-endpoint" },
  settings:  { requests: 30, window: "1 m", key: "settings-endpoint" },
  auth:      { requests: 5,  window: "1 m", key: "auth-endpoint" },
  fileUpload:{ requests: 5,  window: "10 m", key: "upload-endpoint" },
} as const;