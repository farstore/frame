"use client";
import Link from 'next/link';
import { useEffect, useState, useCallback } from "react";
import sdk, {
  type FrameContext,
} from "@farcaster/frame-sdk";
import {
  useReadContract,
} from "wagmi";
import { Address } from "viem";
import { Button } from "~/components/ui/Button";
import {
  farstoreAbi,
  farstoreAddress,
} from "~/constants/abi-farstore";

import AppTileContainer from "./AppTileContainer";

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<FrameContext>();
  const [cacheBust, setCacheBust] = useState(0);
  const [frameAdded, setFrameAdded] = useState(false);

  const [pages, setPages] = useState(1);

  const added = frameAdded || (context && context.client && context.client.added);
  const notifications = frameAdded || (context && context.client && context.client.notificationDetails);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      sdk.actions.ready({});
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  const addFrame = async () => {
    try {
      setFrameAdded(true);
      await sdk.actions.addFrame();
      setCacheBust(cacheBust + 1);
    } catch (e) {
      console.log(e);
    }
  };

  const { data: getListedRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getListedFrames",
    args: [],
  });
  const listedRes = (getListedRes || []) as bigint[];
  const numListed = listedRes.length;
  const max = Math.min(10 * pages, numListed);
  const frameIds = listedRes.map(id => Number(id)).sort((a, b) => a > b ? -1 : 1).slice(0, max);

  const addButton = !!context ? (
    <div
      style={{
        display: !added || !notifications ? 'block' : 'none',
        textAlign: "center",
        padding: '1em 1em 2em 1em',
        borderRadius: '12px',
        marginBottom: '1em',
      }}
    >
      {
        !added &&
        <div className="italic">
          <p>Get notified as new apps launch:</p>
          <Button onClick={addFrame}>Add Farstore</Button>
        </div>
      }
      {
        added && !notifications &&
        <div className="italic">
          <p>Notifications are off. Turn them on from the menu in the top right.</p>
        </div>
      }
    </div>
  ) : (
    <div className="text-center py-4 italic">
      <p>Not on Farcaster? <Link href="https://link.warpcast.com/download-qr">Join here.</Link></p>
    </div>
  )

  const openUrl = useCallback((url: string) => {
    const normalizedUrl = url.indexOf('://') > -1 ? url : `https://${url}`;
    if (!!context) {
      sdk.actions.openUrl(`https://warpcast.com/?launchFrameUrl=${normalizedUrl}`);
    } else {
      window.open(normalizedUrl, '_blank');
    }
  }, [context]);

  return (
    <div className="max-w-[500px] mx-auto px-4">
      <div className="mx-auto py-4">
        <h1 className="text-2xl font-bold text-center mb-4 mt-4">Discover Farcaster Apps</h1>
        {addButton}
        <div className="flex my-4 font-bold">
          <div className="flex-grow">Recently added apps</div>
          <div className="flex-shrink"><Link href="/list" style={{ color: '#7C65C1', textDecoration: 'none' }}>Submit →</Link></div>
        </div>
        {
          frameIds.map(id => (
            <div key={id} className="mb-4">
              <AppTileContainer frameId={id} openUrl={openUrl} />
            </div>
          ))
        }
        {
          numListed != frameIds.length &&
          <button type="button" className="secondary-button mt-2 mb-10" onClick={() => setPages(pages + 1)}>
            Load more
          </button>
        }
      </div>
    </div>
  );
}
