"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
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
import { fetchUsers } from "~/store/slices/userSlice";
import {
  getAppByDomain,
  verifyFrame,
  getNullAddress,
} from "~/lib/data";

import { Dispatch } from "~/store";
import Username from "./Username";

export default function List() {
  const { setOpen } = useModal();
  const { address: connectedAddress } = useAccount();
  const router = useRouter();
  const dispatch = useDispatch<Dispatch>();

  const [domain, setDomain] = useState<string>('');
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
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
      // setListing(false);
      setChecking(false);
      setCacheBust(prev => prev + 1);
    }
  }, [writeError, isConfirmed]);

  const { data: appIdRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getAppIdByDomain",
    args: [loaded ? domain : ""],
    scopeKey: `create-${cacheBust}`,
  });
  const appId = Number((appIdRes || 0n) as bigint);

  useEffect(() => {
    if (owner && owner != getNullAddress()) {
      dispatch(fetchUsers([owner]));
    }
  }, [dispatch, owner]);

  useEffect(() => {
    if (appId && isConfirmed) {
      getAppByDomain(domain).then(() => {
        router.push(`/${domain}`);
      });
    }
  }, [router, appId, domain, isConfirmed]);

  const list = async () => {
    setError(null);
    setListing(true);
    try {
      const { owner, signature } = await verifyFrame(domain);
      if (!connectedAddress) {
        throw new Error('Connect a wallet to proceed');
      }
      writeContract({
        abi: farstoreVerifierAbi,
        address: farstoreVerifierAddress,
        functionName: "list",
        args: [
          domain,
          owner,
          signature,
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
    const { owner } = await verifyFrame(domain);
    setName(name);
    setIconUrl(iconUrl);
    setOwner(owner);
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
    <div className="max-w-[400px] mx-auto py-4 px-4">
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
            <div
              style={{
                width: "8em",
                height: "8em",
                margin: '0 auto',
                alignItems: 'center',
                justifyContent: 'center',
                // borderRadius: '12px',
                // border: '1px solid #ccc',
              }}
            >
              <img
                className="ui-island"
                src={iconUrl || '/fallback-icon.png'}
                style={{ borderRadius: '12px', maxHeight: '100%' }}
                alt="app-logo"
              />
            </div>
            <br />
            <h2>{name}</h2>
            <div>by <Username address={owner || getNullAddress()} /></div>
          </div>
        </div>
      }
      {
        !loaded &&
        <div>
          <div className="mt-2">
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              disabled={checking}
              placeholder="app url (e.g. far.store)"
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
          <button
            className="claim-button mt-2"
            disabled={listing}
            onClick={connectedAddress ? list : () => setOpen(true)}
          >
            {
              connectedAddress ? 'Submit' : 'Connect Wallet'
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
