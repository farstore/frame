"use client";
import Link from 'next/link';
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';

import sdk, { Context } from "@farcaster/frame-sdk";
import {
  fetchAllApps,
  filterApps,
} from "~/store/slices/appSlice";
import { Dispatch, State } from "~/store";

import AppTileContainer from "./AppTileContainer";

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [cacheBust, setCacheBust] = useState(0);
  const [frameAdded, setFrameAdded] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('fund');
  const [loaded, setLoaded] = useState(false);
  const domains = useSelector((state: State) => state.app.filteredDomains);
  const count = useSelector((state: State) => state.app.count);
  console.log(domains);
  const dispatch = useDispatch<Dispatch>();

  const added = frameAdded || (context && context.client && context.client.added);
  // const notifications = frameAdded || (context && context.client && context.client.notificationDetails);

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
    dispatch(fetchAllApps());
  }, [dispatch]);

  useEffect(() => {
    dispatch(filterApps({ filter, search, sort: '' }));
  }, [dispatch, search, filter, count]);

  useEffect(() => {
    if (count > 0 && !loaded) {
      setLoaded(true);
    }
  }, [count, loaded]);

  const addFrame = async () => {
    try {
      setFrameAdded(true);
      await sdk.actions.addFrame();
      setCacheBust(cacheBust + 1);
    } catch (e) {
      console.log(e);
    }
  };
  const onFc = !!context;
  useEffect(() => {
    if (onFc && !added) {
      addFrame()
    }
  }, [onFc, added]);

  return (
    <div className="max-w-[500px] mx-auto px-4">
      <div className="mx-auto py-4">
        <h1 className="text-2xl font-bold text-center mt-4">Discover Farcaster Apps</h1>
        <div className="text-center py-8 italic">
          <div className="flex-shrink">
            <Link href="/list" style={{ color: '#8C75D1', textDecoration: 'none', fontWeight: 'bold' }}>Submit an app →</Link>
          </div>
        </div>
        <div className="flex" style={{ marginBottom: '1em' }}>
          <div className="flex-shrink">
            <button
              className={`ui-island secondary-button ${filter == 'fund' ? 'selected' : ''}`}
              onClick={() => setFilter('fund')}
            >
              Fund
            </button>
          </div>
          <div className="flex-shrink">&nbsp;</div>
          <div className="flex-shrink">
            <button
              className={`ui-island secondary-button ${filter == 'trade' ? 'selected' : ''}`}
              onClick={() => setFilter('trade')}
            >
              Trade
            </button>
          </div>
          <div className="flex-shrink">&nbsp;</div>
          <input
            type="text"
            name="search"
            placeholder="search apps"
            className="text-input flex-grow"
            onClick={() => {
              setFilter('');
              setSearch(search);
            }}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            style={{ padding: '.5em 1em', width: '100%' }}
          />
        </div>
        {
          !loaded ? (
            <div style={{ textAlign: 'center' }}>
              <div className="loading-spinner-bg loading-spinner" style={{ width: '4em', height: '4em', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ fontWeight: 'bold', marginBottom: '1em', marginLeft: '1em' }}>
              {filter == 'fund' && 'Fund apps that deserve a coin'}
              {filter == 'trade' && 'Trade the apps you believe in'}
            </div>
          )
        }
        {
          domains.map(domain => (
            <div key={domain} className="mb-4">
              <AppTileContainer domain={domain} />
            </div>
          ))
        }
      </div>
    </div>
  );
}
