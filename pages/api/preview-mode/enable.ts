import { validatePreviewUrl } from '@sanity/preview-url-secret'
import { apiVersion, dataset, projectId } from 'lib/sanity.api'
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'next-sanity'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) {
    return res
      .status(500)
      .send(
        'Preview requires `SANITY_API_READ_TOKEN`. Add it to .env.local and restart the dev server.',
      )
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  })

  const {
    isValid,
    redirectTo = '/',
    studioPreviewPerspective,
  } = await validatePreviewUrl(client, req.url)
  if (!isValid) {
    return res.status(401).send('Invalid secret')
  }

  // Enable Preview Mode by setting the cookies, and current selected perspective as preview data that can be retrieved in getStaticProps
  res.setPreviewData(studioPreviewPerspective)

  res.redirect(redirectTo)
}
