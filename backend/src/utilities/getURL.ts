export const getServerSideURL = () => {
  return process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export const getFrontendURL = () => {
  return process.env.FRONTEND_URL || 'http://localhost:4321'
}

export const getInternalFrontendURL = () => {
  return process.env.INTERNAL_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:4321'
}

