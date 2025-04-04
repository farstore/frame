"use client";
import Link from 'next/link';
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';

import sdk, { Context } from "@farcaster/frame-sdk";
import {
  useReadContract,
} from "wagmi";
import { Address } from "viem";
import { Button } from "~/components/ui/Button";
import {
  farstoreAbi,
  farstoreAddress,
} from "~/constants/abi-farstore";
import {
  fetchAppByDomain,
} from "~/store/slices/appSlice";
import {
  getNullAddress,
} from "~/lib/data";
import { Dispatch, State } from "~/store";

import Username from "./Username";

export default function Listing({ domain }: { domain: string; }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [cacheBust, setCacheBust] = useState(0);
  const [frameAdded, setFrameAdded] = useState(false);

  const dispatch = useDispatch<Dispatch>();

  const added = frameAdded || (context && context.client && context.client.added);
  const notifications = frameAdded || (context && context.client && context.client.notificationDetails);

  const { data: frameIdRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getId",
    args: [domain],
  });
  const frameId = Number(frameIdRes as bigint);
  const frame = useSelector((state: State) => state.app.frames[frameId]);
  const token = useSelector((state: State) => state.app.tokens[frameId]);

  const { data: ownerRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getOwner",
    args: [frameId],
  });
  const owner = (ownerRes || getNullAddress()) as string;

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

  useEffect(() => {
    dispatch(fetchAppByDomain(domain));
  }, [dispatch, domain]);

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
          <p>Follow the latest launches:</p>
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
      if (window.navigator.userAgent == 'warpcast') {
        sdk.actions.openUrl(`https://warpcast.com/~/frames/launch?url=${encodeURIComponent(normalizedUrl)}`);
      } else {
        sdk.actions.openUrl(`https://warpcast.com/~/mini-apps/launch?url=${encodeURIComponent(normalizedUrl)}`);
      }
    } else {
      window.open(normalizedUrl, '_blank');
    }
  }, [context]);

  if (!frame) {
    return (<div>Loading</div>);
  }

  const banner = frame.imageUrl || frame.iconUrl;
  const tagline = frame.tagline;

  const options = [
    "embed=1",
    "loadChartSettings=0",
    "trades=0",
    "tabs=0",
    "info=0",
    "chartLeftToolbar=0",
    "chartTheme=dark",
    "theme=dark",
    "chartStyle=1",
    "chartType=usd",
    "interval=60",
  ];

  return (
    <div className="max-w-[700px] mx-auto px-4">
      <div className="mx-auto py-4">
        {addButton}
        {
          frame &&
          <div className="listing-width mb-4" style={{ margin: '0 auto' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                // overflow: 'hidden',
                textAlign: 'center',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${banner})`,
                  zIndex: '-1',
                  backgroundSize: 'contain',
                  filter: 'blur(50px)'
                }}
              />
              <img
                alt="app-banner"
                className='listing-height'
                style={{ margin: '0 auto', maxWidth: '100%', borderRadius: '12px' }}
                src={banner}
              />
            </div>
            <div className="flex my-4" style={{ alignItems: "center" }}>
              <div className="flex-grow">
                <div style={{ fontSize: '1.75em' }}>{frame.name}</div>
                <div>by <Username address={owner || ''} /></div>
              </div>
              <div className="flex-shrink">
                <Button onClick={() => openUrl(frame.homeUrl)}>Open</Button>
              </div>
            </div>
            <div className="my-2" style={{ fontSize: "1em" }}>
              {
                tagline != null &&
                <div>{tagline}</div>
              }
            </div>
          </div>
        }
        <br />
        {
          token ? (
            <div style={{ paddingBottom: '3em' }}>
              <iframe
                className="dexscreener-iframe"
                style={{ borderRadius: '12px' }}
                src={`https://dexscreener.com/base/${token}?${options.join('&')}`}
              />
            </div>
          ) : (
            null
          )
        }
      </div>
    </div>
  );
}
