"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useModal } from "connectkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from "wagmi";
import { base } from "wagmi/chains";

import sdk, {
  // type FrameContext,
} from "@farcaster/frame-sdk";
import axios from "axios";

import {
  farstoreVerifierAddress,
  farstoreVerifierAbi,
} from "~/constants/abi-farstore-verifier";
import {
  farstoreAbi,
  farstoreAddress,
} from "~/constants/abi-farstore";

import {
  getAppByDomain,
  verifyFrame,
  getNullAddress,
} from "~/lib/data";

import AppTile from "./AppTile";

export default function List() {
  const { setOpen } = useModal();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();

  const [domain, setDomain] = useState<string>('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  const [listing, setListing] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState<number>(1);

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      await sdk.context;
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

  const { writeContract, error: writeError, data: writeData } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  useEffect(() => {
    if (writeError) {
      setListing(false);
      setChecking(false);
      setTimeout(() => setError(writeError.message.split('\n')[0]), 1);
    } else if (isConfirmed) {
      setListing(false);
      setChecking(false);
      setCacheBust(prev => prev + 1);
    }
  }, [writeError, isConfirmed]);

  const { data: frameIdRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getId",
    args: [domain],
    scopeKey: `create-${cacheBust}`,
  });
  const frameId = Number((frameIdRes || 0n) as bigint);

  useEffect(() => {
    if (frameId && isConfirmed) {
      getAppByDomain(domain).then(() => {
        router.push(`/app/${domain}`);
      });
    }
  }, [router, frameId, domain, isConfirmed]);

  const list = async () => {
    setError(null);
    setListing(true);
    try {
      const { eligibleOwners, signature } = await verifyFrame(domain);
      if (!connectedAddress || eligibleOwners.filter(a => a.toLowerCase() == connectedAddress.toLowerCase()).length == 0) {
        throw new Error('Your address is not linked to the Farcaster account that owns this app');
      }
      writeContract({
        abi: farstoreVerifierAbi,
        address: farstoreVerifierAddress,
        functionName: "list",
        args: [
          domain,
          eligibleOwners,
          signature,
          getNullAddress(),
          [],
          [],
        ],
        chainId: base.id,
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(e.response?.data?.error);
      } else {
        setError((e as Error).message);
      }
      setListing(false);
    }
  };

  const lookup = async (domain: string) => {
    const { frame: { name, iconUrl } } = await getAppByDomain(domain);
    setName(name);
    setIconUrl(iconUrl);
  };

  const check = async () => {
    setError(null);
    try {
      setChecking(true);
      const formattedDomain = new URL(domain.indexOf('://') == -1 ? `https://${domain}` : domain).hostname;
      setDomain(formattedDomain);
      await lookup(formattedDomain);
      setLoaded(true);
    } catch (e) {
      setChecking(false);
      console.log(e);
      setError('Invalid URL');
    }
  }

  return (
    <div className="max-w-[500px] mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold text-center mb-4 mt-4">Submit App</h1>
      {
        (checking || loaded) &&
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: loaded ? 'inline-block' : 'none',
              padding: '.5em',
            }}
          >
            <AppTile
              owner={getNullAddress()}
              iconUrl={iconUrl}
              name={name}
              liquidity={0}
            />
          </div>
        </div>
      }
      {
        !loaded &&
        <div>
          <p>Enter the url of your app</p>
          <div className="mt-2">
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              disabled={checking}
              placeholder="e.g. warpcast.com"
              className="text-input"
              style={{ margin: '1em 0' }}
            />
          </div>
          <button
            className="claim-button mt-2"
            disabled={checking}
            onClick={check}
          >
            {checking ? 'Loading' : 'Next →'}
          </button>
        </div>
      }
      {
        loaded &&
        <div className="mt-4">
          <p>This will register your app onchain</p>
          <button
            className="claim-button mt-2"
            disabled={listing}
            onClick={connectedAddress ? list : () => setOpen(true)}
          >
            {
              connectedAddress ? 'Submit' : 'Connect Wallet and Submit'
            }
          </button>
        </div>
      }
      { error ? (
        <div className="mb-4 mt-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
            <pre className="font-mono text-xs whitespace-pre-wrap break-words overflow-x-">{error}</pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
