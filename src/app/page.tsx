import { Metadata } from "next";
import Home from "~/components/Home";
import { getAppUrl } from "~/lib/data";

const appUrl = getAppUrl();

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Browse",
    action: {
      type: "launch_frame",
      name: "Farstore",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#ffffff",
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Farstore",
    openGraph: {
      title: "Farstore",
      description: "Farcaster App Store",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function HomePage() {
  return (
    <Home />
  );
}
