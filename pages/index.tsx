import IndexPage from 'components/IndexPage'
import PreviewIndexPage from 'components/PreviewIndexPage'
import { authCookieName, verifyAuthToken } from 'lib/auth'
import { readToken } from 'lib/sanity.api'
import { getAllPosts, getClient, getSettings } from 'lib/sanity.client'
import { Post, Settings } from 'lib/sanity.queries'
import { GetServerSideProps } from 'next'
import type { SharedPageProps } from 'pages/_app'

interface PageProps extends SharedPageProps {
  posts: Post[]
  settings: Settings
}

interface Query {
  [key: string]: string
}

export default function Page(props: PageProps) {
  const { posts, settings, previewMode } = props

  if (previewMode) {
    return <PreviewIndexPage posts={posts} settings={settings} />
  }

  return (
    <main>
      <IndexPage posts={posts} settings={settings} />
    </main>
  )
}

export const getServerSideProps: GetServerSideProps<
  PageProps,
  Query
> = async (ctx) => {
  const token = ctx.req.cookies?.[authCookieName]
  const payload = token ? verifyAuthToken(token) : null

  if (!payload) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }

  const { preview: previewMode = false, previewData } = ctx
  const client = getClient(
    previewMode ? { token: readToken, perspective: previewData } : undefined,
  )

  const [settings, posts = []] = await Promise.all([
    getSettings(client),
    getAllPosts(client),
  ])

  return {
    props: {
      posts,
      settings,
      previewMode,
      previewPerspective: typeof previewData === 'string' ? previewData : null,
      token: previewMode ? readToken : '',
    },
  }
}
