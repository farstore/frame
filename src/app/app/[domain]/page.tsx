import { Metadata } from "next";

import Listing from "~/components/Listing";
import { getAppUrl } from "~/lib/data";

const appUrl = getAppUrl();


export const revalidate = 300;

type Props = {
  params: Promise<{ domain: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const frame = {
    version: "next",
    imageUrl: `${appUrl}/app/${domain}/opengraph-image`,
    button: {
      title: "View App",
      action: {
        type: "launch_frame",
        name: "Farstore",
        url: `${appUrl}/app/${domain}`,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#ffffff",
      },
    },
  };
  return {
    title: "Farstore",
    openGraph: {
      title: "Farstore",
      description: "Farcaster App Store",
    },
    other: {
      "fc:frame": JSON.stringify(frame), // make sure `frame` is defined
    },
  };
}

export default async function DomainPage({ params }: Props) {
  const { domain } = await params;
  return (
    <Listing domain={domain} />
  );
}