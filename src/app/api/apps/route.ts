import axios from "axios";

const baseUrl = process.env.FARSTORE_API_URL;

export async function GET() {
  try {
    const { data: fcJson } = await axios.get(`${baseUrl}/apps`);
    return Response.json(fcJson.results);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
