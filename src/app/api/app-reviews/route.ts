import { NextRequest } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const domain = request.nextUrl.searchParams.get('domain') || '';
  try {
    if (domain.length == 0 || /[^\w\.\-]/.test(domain)) {
      throw new Error('Invalid domain');
    }
    const { data } = await axios.post('https://fcs-v-0-jochanolm.replit.app/farstore-miniapp-key-promoters?api_key=password.lol', {
      miniapp_name: domain
    });
    return Response.json(data);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
