import { NextRequest } from "next/server";
import axios from "axios";

const baseUrl = process.env.FARSTORE_API_URL;

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || '';
  try {
    if (domain.length == 0 || /[^\w\.\-]/.test(domain)) {
      throw new Error('Invalid domain');
    }
    const { data: fcJson } = await axios.get(`${baseUrl}/app/${domain}`);
    return Response.json(fcJson.results);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
