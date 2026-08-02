declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      PAYLOAD_PUBLIC_SERVER_URL: string
      FRONTEND_URL: string
      PREVIEW_SECRET: string
      CRON_SECRET: string
      RESEND_API_KEY: string
      RESEND_FROM_EMAIL: string
      MEDIA_PATH: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
