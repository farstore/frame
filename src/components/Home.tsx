"use client";
import Link from 'next/link';
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';

import sdk, { Context } from "@farcaster/frame-sdk";
import { Button } from "~/components/ui/Button";
import {
  fetchApps,
  filterApps,
  sortApps,
} from "~/store/slices/appSlice";
import { Dispatch, State } from "~/store";

import AppTileContainer from "./AppTileContainer";

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [cacheBust, setCacheBust] = useState(0);
  const [frameAdded, setFrameAdded] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('liquid');
  const filteredFrameIds = useSelector((state: State) => state.app.filteredFrameIds);
  const sortedFrameIds = useSelector((state: State) => state.app.sortedFrameIds);
  const count = useSelector((state: State) => state.app.count);

  const dispatch = useDispatch<Dispatch>();

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

  useEffect(() => {
    dispatch(fetchApps([]));
  }, [dispatch]);

  useEffect(() => {
    if (search.length > 0) {
      dispatch(filterApps(search));
    }
  }, [dispatch, search]);

  useEffect(() => {
    dispatch(sortApps(sort));
  }, [dispatch, sort, count]);

  const addFrame = async () => {
    try {
      setFrameAdded(true);
      await sdk.actions.addFrame();
      setCacheBust(cacheBust + 1);
    } catch (e) {
      console.log(e);
    }
  };

  const frameIds = search.length > 0 ? filteredFrameIds : sortedFrameIds;

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
          <p className="mb-2">Follow the latest launches:</p>
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

  return (
    <div className="max-w-[500px] mx-auto px-4">
      <div className="mx-auto py-4">
        <h1 className="text-2xl font-bold text-center mb-4 mt-4">Discover Farcaster Apps</h1>
        {addButton}
        <input
          type="text"
          name="search"
          placeholder="search apps"
          className="mt-4 text-input"
          onChange={(e) => setSearch(e.target.value)}
          value={search}
          style={{ padding: '.5em 1em', width: '100%' }}
        />
        <div className="flex my-4 font-bold">
          <div className="flex-grow">
            Sort by:
            <select
              onChange={(e) => setSort(e.target.value)}
              style={{
                marginLeft: ".5em",
                backgroundColor: "transparent"
              }}
            >
              <option value="liquid">Most liquid</option>
              <option value="recent">Most recent</option>
            </select>
          </div>
          <div className="flex-shrink"><Link href="/list" style={{ color: '#7C65C1', textDecoration: 'none' }}>Submit →</Link></div>
        </div>
        {
          frameIds.map(id => (
            <div key={id} className="mb-4">
              <AppTileContainer frameId={id} openUrl={openUrl} />
            </div>
          ))
        }
      </div>
    </div>
  );
}
