import { NextRequest } from "next/server";

import { ethers } from "ethers";
import axios from "axios";

interface FcJson {
  accountAssociation: {
    header: string;
    payload: string;
    signature: string;
  },
}

interface FcJsonHeader {
  fid: number;
  key: string;
}

interface FcJsonPayload {
  domain: string;
}

interface NeynarUser {
  custody_address: string;
  verified_addresses: {
    eth_addresses: string[];
    primary: {
      eth_address: string | null;
    }
  }
}

interface NeynarUserResponse {
  users: NeynarUser[];
}

const fromBase64Url = (encodedString: string) => {
  // 1. Convert Base64URL to Base64 by replacing URL-safe characters
  const base64String = encodedString.replace(/-/g, '+').replace(/_/g, '/');
  // 2. Decode the Base64 string
  return Buffer.from(base64String, 'base64').toString('utf8');
}
const fromBase64UrlToHex = (encodedString: string) => {
  // 1. Convert Base64URL to Base64 by replacing URL-safe characters
  const base64String = encodedString.replace(/-/g, '+').replace(/_/g, '/');
  // 2. Decode the Base64 string
  return `0x${Buffer.from(base64String, 'base64').toString('hex')}`;
}

export async function GET(request: NextRequest) {
  const domain = (request.nextUrl.searchParams.get('domain') || '').toLowerCase();
  try {
    if (domain.length == 0 || /[^\w\.\-]/.test(domain)) {
      throw new Error('Invalid domain');
    }
    const result = await axios.get(`https://${domain}/.well-known/farcaster.json`);
    const fcJson = result.data as FcJson;
    const fcJsonHeader = JSON.parse(fromBase64Url(fcJson.accountAssociation.header)) as FcJsonHeader;
    const fcJsonPayload = JSON.parse(fromBase64Url(fcJson.accountAssociation.payload)) as FcJsonPayload;
    let fcJsonSignature = null;
    let fcJsonSignature = fromBase64Url(fcJson.accountAssociation.signature);
    if (!fcJsonSignature.startsWith('0x')) {
      // New format
      fcJsonSignature = fromBase64UrlToHex(fcJson.accountAssociation.signature);
    }

    // Get query string parameters
    const fid = fcJsonHeader.fid;

    if (!fcJsonHeader.fid) {
      throw new Error("Missing fid in farcaster.json header");
    }

    if (!fcJsonHeader.key) {
      throw new Error("Missing key in farcaster.json header");
    }

    if (!fcJsonPayload.domain) {
      throw new Error("Missing domain in farcaster.json payload");
    }

    if (fcJsonPayload.domain.toLowerCase() != domain) {
      throw new Error("Domain in farcaster.json differs from the provided domain");
    }

    const signerAddress = ethers.verifyMessage(
      `${fcJson.accountAssociation.header}.${fcJson.accountAssociation.payload}`,
      fcJsonSignature
    );
    if (signerAddress.toLowerCase() != fcJsonHeader.key.toLowerCase()) {
      throw new Error("Unable to verify signature in farcaster.json")
    }

    // Build the URL with the address as query parameters
    const baseUrl = 'https://api.neynar.com/v2/farcaster/user/bulk';  // Replace with the API base URL
    const url = new URL(baseUrl);

    // Append the address as query parameters to the URL
    url.searchParams.append('fids', fid.toString());

    // Perform the HTTPS request
    const neynarResponse = await axios.get(url.toString(), {
      headers: {
        'api_key': process.env.NEYNAR_API_KEY,
        'accept': 'application/json',
      }
    });
    const userData = neynarResponse.data as NeynarUserResponse;
    const user = userData.users && userData.users[0];
    if (!user) {
      throw new Error("Unable to fetch user from Neynar.");
    }
    if (user.custody_address.toLowerCase() != fcJsonHeader.key.toLowerCase()) {
      throw new Error("User FID does not farcaster.json header");
    }
    const owner = user.verified_addresses.primary.eth_address;
    if (!owner) {
      throw new Error("Primary address for user not found");
    }
    const wallet = new ethers.Wallet(process.env.FARSTORE_VERIFIER_KEY as string, null);
    const abiCoder = ethers.AbiCoder.defaultAbiCoder();
    const preimage = ethers.getBytes(abiCoder.encode(
      ["string", "address"],
      [domain, owner]
    ));
    const signature = await wallet.signMessage(preimage);

    return Response.json({ domain, owner, signature });
  } catch (e) {
  return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
