import { NextRequest } from "next/server";

import { ethers } from "ethers";
import axios from "axios";

import { NeynarUser, UserMetadata } from "~/lib/data";

interface NeynarUsersResponse {
  [key: string]: NeynarUser[];
}

export async function GET(request: NextRequest) {
  const addresses = (request.nextUrl.searchParams.get('addresses') || '').toLowerCase().split(',');
  try {
    if (addresses.length == 0) {
      throw new Error('Missing `addresses` param');
    }

    // Build the URL with the address as query parameters
    const baseUrl = 'https://api.neynar.com/v2/farcaster/user/bulk-by-address';  // Replace with the API base URL
    const url = new URL(baseUrl);

    // Append the address as query parameters to the URL
    url.searchParams.append('addresses', addresses.toString());

    // Perform the HTTPS request
    const neynarResponse = await axios.get(url.toString(), {
      headers: {
        'api_key': process.env.NEYNAR_API_KEY,
        'accept': 'application/json',
      }
    });
    const userData = neynarResponse.data as NeynarUsersResponse;
    const users: UserMetadata[] = [];
    addresses.forEach(a => {
      if (userData[a]) {
        users.push({
          address: ethers.getAddress(a),
          user: userData[a].sort((a, b) => a.follower_count > b.follower_count ? -1 : 1)[0]
        });
      }
    });
    return Response.json(users);
  } catch (e) {
  return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
