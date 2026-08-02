export const getServerSideURL = () => {
  return process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000'
}

export const getFrontendURL = () => {
  return process.env.FRONTEND_URL || 'http://localhost:4321'
}
