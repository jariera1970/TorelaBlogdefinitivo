export async function getPosts() {
  const res = await fetch("http://localhost:1337/api/articles?populate=*", {
    headers: {
      Authorization: `Bearer ${import.meta.env.STRAPI_AUTH_TOKEN}`
    }
  });

  const data = await res.json();
  return data.data;
}
