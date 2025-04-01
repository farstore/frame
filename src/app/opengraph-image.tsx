import { ImageResponse } from "next/og";
import { getAppUrl } from "~/lib/data";
import axios from "axios";

export const contentType = "image/png";
export const runtime = 'edge'; // Required for Edge Functions

export default async function Image() {
  const appUrl = getAppUrl();
  const domain = new URL(appUrl).host;

  const { data } = await axios.get(`${appUrl}/app/${domain}`);
  const {
    name,
    iconUrl,
    tagline,
  } = data.results.frame;
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center align-center items-start relative" style={{ background: 'linear-gradient(105deg, white 0%, #E1DED0 100%)', color: '#000000' }}>
        <div tw="flex flex-col">
          <div tw="ml-10 mb-5 flex flex-row align-center justify-center">
            <img tw="mt-1" src={iconUrl} width="160px" height="160px" alt="farstore-logo" style={{ borderRadius: '12px' }} />
            <div tw="ml-10 flex flex-col text-left align-center justify-center">
              <div tw="text-6xl">{name}</div>
              <div tw="text-2xl ml-1">{tagline || 'View on Farstore'}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 600,
      height: 400,
    }
  );
}