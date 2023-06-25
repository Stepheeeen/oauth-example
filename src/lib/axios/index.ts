import axios from "axios";

async function GET(
  url: string,
  headers: { [key: string]: string } = {},
  searchParams: URLSearchParams = new URLSearchParams()
) {
  try {
  const response = await axios.get(url, { headers, params: searchParams });
  return response.data;} catch (error) {
    
  }
}

async function POST(url: string, headers: { [key: string]: string }, body: any) {
  const response = await axios.post(url, body, { headers });
  return response.data;
}

const API = { GET, POST };
export default API;
