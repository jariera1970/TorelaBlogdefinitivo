const LOCAL_STRAPI_URL = 'http://localhost:1337';
const PROD_STRAPI_URL = 'https://strapi-blog-torela.onrender.com';

const configuredBaseUrl = import.meta.env.PUBLIC_STRAPI_URL?.trim();

export const STRAPI_BASE_URL = (configuredBaseUrl
  || (import.meta.env.PROD ? PROD_STRAPI_URL : LOCAL_STRAPI_URL)
).replace(/\/$/, '');

export function toAbsoluteStrapiUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${STRAPI_BASE_URL}${url}`;
  return `${STRAPI_BASE_URL}/${url}`;
}

export async function getPosts() {
  const res = await fetch(`${STRAPI_BASE_URL}/api/articles?populate=*`);
  const data = await res.json();

  if (!data?.data) {
    return [];
  }

  return data.data.map((item) => item);
}

export function sortPosts(posts) {
  return posts
    .slice()
    .sort((a, b) => new Date(b.Publicado).valueOf() - new Date(a.Publicado).valueOf());
}
