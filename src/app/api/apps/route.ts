import { NextRequest } from "next/server";
import axios from "axios";

const baseUrl = process.env.FARSTORE_API_URL;

export async function GET(request: NextRequest) {
  const frameIds = request.nextUrl.searchParams.get('frameIds') || '';
  try {
    const { data: fcJson } = await axios.get(`${baseUrl}/apps?frameIds=${frameIds}`);
    return Response.json(fcJson.results);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
