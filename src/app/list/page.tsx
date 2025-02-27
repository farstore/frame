import { Metadata } from "next";

import List from "~/components/List";
import { getAppUrl } from "~/lib/data";

const appUrl = getAppUrl();

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image`,
  button: {
    title: "Farstore",
    action: {
      type: "launch_frame",
      name: "List App",
      url: `${appUrl}/list`,
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
      description: "App Store for Farcaster Frames",
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
}

export default function ListPage() {
  return (
    <List />
  );
}
