export async function getPosts() {
  const res = await fetch("http://localhost:1337/api/articles?populate=*");
  const data = await res.json();

  if (!data?.data) {
    return [];
  }

  return data.data.map((item) => ({
    id: item.id,
    ...item.attributes,
  }));
}

export function sortPosts(posts) {
  return posts
    .slice()
    .sort((a, b) => new Date(b.Publicado).valueOf() - new Date(a.Publicado).valueOf());
}
