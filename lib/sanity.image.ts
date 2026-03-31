import imageUrlBuilder from '@sanity/image-url'
import { getClient } from './sanity.client'

const builder = imageUrlBuilder(getClient())

export function urlForImage(source: any) {
  return builder.image(source)
}
