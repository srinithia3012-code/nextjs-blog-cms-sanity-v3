import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import { createClient } from 'next-sanity'

export function getServerClient() {
  const writeToken = process.env.SANITY_API_WRITE_TOKEN

  if (!writeToken) {
    throw new Error(
      'Missing environment variable: SANITY_API_WRITE_TOKEN (required for auth endpoints)',
    )
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token: writeToken,
    useCdn: false,
  })
}
