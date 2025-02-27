import { getAppUrl } from "~/lib/data";

export async function GET() {
  const appUrl = getAppUrl();
  const accountAssociation = JSON.parse(process.env.FARSTORE_WELLKNOWN_JSON);

  const config = {
    accountAssociation,
    frame: {
      version: "1",
      name: "Farstore",
      iconUrl: `${appUrl}/icon.png`,
      homeUrl: appUrl,
      imageUrl: `${appUrl}/opengraph-image`,
      buttonTitle: "Explore Apps",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#ffffff",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}
