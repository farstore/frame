import Link from 'next/link';
import {
  useReadContract,
} from "wagmi";
import { useSelector } from "react-redux";
import { Address } from "viem";

import {
  farstoreAbi,
  farstoreAddress,
} from "~/constants/abi-farstore";

import {
  getNullAddress,
} from "~/lib/data";
import { State } from "~/store";

import AppTile from "./AppTile";

export default function AppTileContainer({
  frameId,
  frameDomain,
  openUrl
}: {
  frameId?: number;
  frameDomain?: string;
  openUrl: (url: string) => void;
}) {

  const domainRes = useSelector((state: State) => state.app.domains[frameId as number]);
  const frame = useSelector((state: State) => state.app.frames[frameId as number]);
  const domain = (frameDomain || domainRes || '') as string;

  const { data: ownerRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getOwner",
    args: [frameId],
  });
  const owner = (ownerRes || getNullAddress()) as string;

  if (!frame) {
    return null;
  }

  return (
    <Link
      href={`/app/${domain}`}
      style={{ cursor: 'pointer', textDecoration: 'none' }}
    >
      <AppTile
        name={frame.name}
        iconUrl={frame.iconUrl}
        tagline={frame.tagline}
        owner={owner}
        openAction={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          e.stopPropagation();
          e.preventDefault();
          openUrl(frame.homeUrl || domain);
        }}
      />
    </Link>
  );
}