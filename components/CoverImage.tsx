import cn from 'classnames'
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from 'lib/sanity.image'

interface CoverImageProps {
  title: string
  slug?: string
  image: any
  priority?: boolean
}

export default function CoverImage({
  title,
  slug,
  image: source,
  priority,
}: CoverImageProps) {
  // ✅ Sanity-safe check
  if (!source?.asset) {
    return <div className="bg-gray-200 aspect-[2/1]" />
  }

  const imageUrl = urlForImage(source)
    .width(2000)
    .height(1000)
    .fit('crop')
    .url()

  const image = (
    <div
      className={cn('shadow-small', {
        'transition-shadow duration-200 hover:shadow-medium': slug,
      })}
    >
      <Image
        src={imageUrl}
        alt={title || 'Cover image'}
        width={2000}
        height={1000}
        sizes="100vw"
        priority={priority}
        className="w-full h-auto"
      />
    </div>
  )

  return slug ? (
    <Link href={`/posts/${slug}`} aria-label={title}>
      {image}
    </Link>
  ) : (
    image
  )
}
