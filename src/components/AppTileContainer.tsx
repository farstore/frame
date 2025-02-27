import {
  useReadContract,
} from "wagmi";
import { useEffect, useState } from "react";
import { Address } from "viem";

import {
  farstoreAbi,
  farstoreAddress,
} from "~/constants/abi-farstore";

import {
  getFrame,
  getNullAddress,
} from "~/lib/data";

import AppTile from "./AppTile";

export default function AppTileContainer({
  frameId,
  frameDomain,
  onLoad,
  openUrl
}: {
  frameId?: number;
  frameDomain?: string;
  onLoad?: (e?: string) => void;
  openUrl: (url: string) => void;
}) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const { data: domainRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getDomain",
    args: [frameId],
  });
  const domain = (frameDomain || domainRes || '') as string;

  const { data: ownerRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getOwner",
    args: [frameId],
  });
  const owner = (ownerRes || getNullAddress()) as string;

  useEffect(() => {
    const lookup = async (domain: string) => {
      try {
        const { name, iconUrl } = await getFrame(domain);
        setName(name);
        setIconUrl(iconUrl);
        if (onLoad) {
          onLoad();
        }
      } catch (e) {
        console.log(e);
        if (onLoad) {
          onLoad((e as Error).message);
        }
      }
    }
    if (domain) {
      lookup(domain);
    }
  }, [domain, onLoad]);

  return (
    <div onClick={() => openUrl(domain)} style={{ cursor: 'pointer' }}>
      <AppTile iconUrl={iconUrl} name={name} owner={owner} />
    </div>
  );
}