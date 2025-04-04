import { ImageResponse } from "next/og";

export const contentType = "image/png";

const baseUrl = process.env.NEXT_PUBLIC_URL;

export default async function Image() {
  return new ImageResponse(
    (
      <div tw="h-full w-full flex flex-col justify-center align-center items-start relative" style={{ background: 'linear-gradient(105deg, white 0%, #E1DED0 100%)', color: '#000000' }}>
        <div tw="flex flex-col">
          <div tw="ml-10 mb-5 flex flex-row align-center justify-center">
            <img tw="mt-1" src={`${baseUrl}/favicon-96x96.png`} width="96px" height="96px" alt="farstore-logo" />
            <div tw="ml-10 flex flex-col text-left">
              <div tw="text-6xl">Farstore</div>
              <div tw="text-2xl ml-1">Farcaster App Store</div>
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
