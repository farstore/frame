"use client";
import Link from 'next/link';
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from 'connectkit';
import sdk, { Context } from "@farcaster/frame-sdk";
import { switchChain } from '@wagmi/core'
import { base } from "wagmi/chains";
import { Address, formatUnits, parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt
} from 'wagmi';
import {
  config
} from '~/components/providers/WagmiProvider';
import { prettyPrint } from '~/lib/formatting';
import { Button } from "~/components/ui/Button";
import {
  farstoreAbi,
  farstoreAddress,
} from "~/constants/abi-farstore";

import {
  launcherAbi,
  launcherAddress,
} from "~/constants/abi-launcher";

import {
  deployerAbi,
  // deployerAddress,
} from "~/constants/abi-deployer";

import {
  tokenAbi,
} from "~/constants/abi-token";
import {
  fetchAppByDomain,
} from "~/store/slices/appSlice";
import {
  fetchUsers,
} from "~/store/slices/userSlice";
import {
  getNullAddress,
} from "~/lib/data";
import { Dispatch, State } from "~/store";

import Username from "./Username";

export default function Listing({ domain }: { domain: string; }) {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [cacheBust, setCacheBust] = useState(0);
  const [funding, setFunding] = useState(false);
  const [refunding, setRefunding] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [startingTransfer, setStartingTransfer] = useState(false);
  const [finishingTransfer, setFinishingTransfer] = useState(false);
  const [cancellingTransfer, setCancellingTransfer] = useState(false);
  const [pendingOwnerInput, setPendingOwnerInput] = useState('');
  const [fundInput, setFundInput] = useState('');
  const [frameAdded, setFrameAdded] = useState(false);
  // const [error, setError] = useState<string|null>(null);

  const account = useAccount();
  const userAddress = account.address;
  const dispatch = useDispatch<Dispatch>();
  const frame = useSelector((state: State) => state.app.frames[domain]);
  const token = useSelector((state: State) => state.app.tokens[domain]);
  const { setOpen } = useModal();
  const { writeContract, error: writeError, data: writeData } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  const added = frameAdded || (context && context.client && context.client.added);
  const notifications = frameAdded || (context && context.client && context.client.notificationDetails);
  const wei = parseUnits((fundInput || '0').toString(), 18);

  useEffect(() => {
    if (writeError) {
      setFunding(false);
      setRefunding(false);
      setClaiming(false);
      setStartingTransfer(false);
      setFinishingTransfer(false);
      setCancellingTransfer(false);
      // @ts-expect-error: TS2339
      window.alert(writeError.shortMessage || writeError.message);
    } else if (isConfirmed) {
      setFunding(false);
      setRefunding(false);
      setClaiming(false);
      setStartingTransfer(false);
      setFinishingTransfer(false);
      setCancellingTransfer(false);
      setFundInput('');
      setCacheBust(cacheBust + 1);
    }
  }, [writeError, isConfirmed]);


  const { data: appIdRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getAppIdByDomain",
    args: [domain],
  });
  const appId = (appIdRes || 0n) as string;

  const { data: ownerRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getAppOwner",
    args: [appId],
    scopeKey: `owner-${cacheBust}`,
  });
  const owner = (ownerRes || getNullAddress()) as string;

  const { data: pendingOwnerRes } = useReadContract({
    abi: farstoreAbi,
    address: farstoreAddress as Address,
    functionName: "getAppPendingOwner",
    args: [appId],
    scopeKey: `pending-owner-${cacheBust}`,
  });
  const pendingOwner = (pendingOwnerRes || getNullAddress()) as string;

  const { data: symbolRes } = useReadContract({
    abi: tokenAbi,
    address: token as Address,
    functionName: "symbol",
    args: [],
  });
  const symbol = (symbolRes || '') as string;

  const { data: deployerRes } = useReadContract({
    abi: tokenAbi,
    address: token as Address,
    functionName: "getDeployer",
    args: [],
  });
  const deployer = (deployerRes || getNullAddress()) as string;

  const { data: fundersRes } = useReadContract({
    abi: launcherAbi,
    address: launcherAddress as Address,
    functionName: "getAppUsersAndFunds",
    args: [appId],
    scopeKey: `funders-${cacheBust}`,
  });
  const [funders, funds] = (fundersRes || [[], []]) as [string[], bigint[]];

  const { data: userTokenClaimRes } = useReadContract({
    abi: deployerAbi,
    address: deployer as Address,
    functionName: "getUserTokenClaim",
    args: [userAddress, token],
    scopeKey: `funders-${cacheBust}`,
  });
  const userTokenClaim = (userTokenClaimRes || 0n) as bigint;

   const { data: hasClaimedRes } = useReadContract({
    abi: deployerAbi,
    address: deployer as Address,
    functionName: "hasUserClaimedToken",
    args: [userAddress, token],
    scopeKey: `funders-${cacheBust}`,
  });
  const hasClaimed = (hasClaimedRes || false) as boolean;

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
    if (owner != getNullAddress()) {
      dispatch(fetchUsers([owner]));
    }
  }, [dispatch, owner]);

  useEffect(() => {
    dispatch(fetchAppByDomain(domain));
  }, [dispatch, domain]);

  useEffect(() => {
    if (funders.length > 0) {
      dispatch(fetchUsers(funders));
    }
  }, [dispatch, funders]);

  const addFrame = async () => {
    try {
      setFrameAdded(true);
      await sdk.actions.addFrame();
      setCacheBust(cacheBust + 1);
    } catch (e) {
      console.log(e);
    }
  };

  const fund = async () => {
    if (!account) {
      setOpen(true);
      return;
    }
    setFunding(true);
    if (account.chainId != base.id) {
      await switchChain(config, { chainId: base.id });
    }
    writeContract({
      abi: launcherAbi,
      address: launcherAddress as Address,
      functionName: "fund",
      args: [domain],
      chainId: base.id,
      value: wei
    });
  };

  const refund = async () => {
    setRefunding(true);
    if (account.chainId != base.id) {
      await switchChain(config, { chainId: base.id });
    }
    writeContract({
      abi: launcherAbi,
      address: launcherAddress as Address,
      functionName: "refund",
      args: [domain],
      chainId: base.id,
    });
  };

  const startTransfer = async () => {
    setStartingTransfer(true);
    if (account.chainId != base.id) {
      await switchChain(config, { chainId: base.id });
    }
    writeContract({
      abi: farstoreAbi,
      address: farstoreAddress as Address,
      functionName: "startTransfer",
      args: [domain, pendingOwnerInput],
      chainId: base.id,
    });
  };

  const cancelTransfer = async () => {
    setCancellingTransfer(true);
    if (account.chainId != base.id) {
      await switchChain(config, { chainId: base.id });
    }
    writeContract({
      abi: farstoreAbi,
      address: farstoreAddress as Address,
      functionName: "cancelTransfer",
      args: [domain],
      chainId: base.id,
    });
  };

  const finishTransfer = async () => {
    setFinishingTransfer(true);
    if (account.chainId != base.id) {
      await switchChain(config, { chainId: base.id });
    }
    writeContract({
      abi: farstoreAbi,
      address: farstoreAddress as Address,
      functionName: "finishTransfer",
      args: [domain],
      chainId: base.id,
    });
  };

  const claim = async () => {
    setClaiming(true);
    if (account.chainId != base.id) {
      await switchChain(config, { chainId: base.id });
    }
    writeContract({
      abi: deployerAbi,
      address: deployer as Address,
      functionName: "claim",
      args: [token],
      chainId: base.id,
    });
  };

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
      <p>Not on Farcaster? <Link href="https://farcaster.xyz/~/signup">Join here.</Link></p>
    </div>
  )

  const openAppUrl = useCallback((url: string) => {
    const normalizedUrl = url.indexOf('://') > -1 ? url : `https://${url}`;
    if (!!context) {
      sdk.actions.openUrl(`https://farcaster.xyz/~/mini-apps/launch?url=${encodeURIComponent(normalizedUrl)}`);
    } else {
      window.open(`https://farcaster.xyz/~/mini-apps/launch?url=${encodeURIComponent(normalizedUrl)}`, '_blank');
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

  const showContributions =
    !token ||                     // No token OR
    deployer != getNullAddress()  // Token deployed via farstore
  ;

  const needsRefund =
    token &&                                        // token exists AND
    deployer == getNullAddress() &&                 // not deployed by farstore AND
    funders.filter(f => f == userAddress).length > 0   // they contributed
  ;

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
              <img
                alt="app-banner"
                className='listing-fixed-width'
                style={{ margin: '0 auto', width: '100%', borderRadius: '12px' }}
                src={banner}
              />
            </div>
            <div className="listing-fixed-width" style={{ margin: '0 auto' }}>
              <div className="flex my-4" style={{ alignItems: "center" }}>
                <div className="flex-grow">
                  <div style={{ fontSize: '1.75em', fontWeight: 'bold' }}>{frame.name}</div>
                  <div>by <Username address={owner || ''} /></div>
                </div>
                <div className="flex-shrink">
                  <Button onClick={() => openAppUrl(frame.homeUrl)}>Open</Button>
                </div>
              </div>
              <div className="my-2" style={{ fontSize: "1em" }}>
                {
                  tagline != null &&
                  <div>{tagline}</div>
                }
              </div>
            </div>
          </div>
        }
        {
          owner != getNullAddress() && owner == userAddress &&
          <div className='listing-fixed-width' style={{ paddingBottom: '3em', margin: '2em auto' }}>
            <div style={{ fontWeight: "bold" }}>App Management 🔒</div>
            {
              pendingOwner == getNullAddress() ? (
                <div>
                  <div style={{ fontSize: '.75em', marginTop: '.5em', marginBottom: '.5em' }}>
                    <p>Transfer this app to a new owner</p>
                  </div>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="text-input flex-grow mt-2"
                    onChange={(e) => setPendingOwnerInput(e.target.value)}
                    value={pendingOwnerInput}
                    style={{ padding: '.5em 1em', width: '100%' }}
                  />
                  <button
                    style={{ marginTop: '1em' }}
                    className="claim-button"
                    disabled={startingTransfer}
                    onClick={startTransfer}
                  >
                    {startingTransfer ? 'Transferring' : 'Transfer'}
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '.75em', marginTop: '.5em' }}>
                    App transfer started. To complete, connect the wallet listed below:
                    <br />
                    <br />
                    {pendingOwner}
                  </div>
                  <button
                    style={{ marginTop: '1em' }}
                    className="claim-button"
                    disabled={cancellingTransfer}
                    onClick={cancelTransfer}
                  >
                    {cancellingTransfer ? 'Cancelling' : 'Cancel'}
                  </button>
                </div>
              )
            }
          </div>
        }
        {
          pendingOwner == userAddress &&
          <div className='listing-fixed-width' style={{ paddingBottom: '3em', margin: '2em auto' }}>
            <div style={{ fontWeight: "bold" }}>Finish transfer</div>
            <div style={{ fontSize: '.75em', marginTop: '.5em', marginBottom: '.5em' }}>
              <p>The owner of this app is requesting to transfer ownership to you. Complete the request below:</p>
            </div>
            <button
              style={{ marginTop: '1em' }}
              className="claim-button"
              disabled={finishingTransfer}
              onClick={finishTransfer}
            >
              {finishingTransfer ? 'Accepting' : 'Accept'}
            </button>
          </div>
        }
        {
          token ? (
            <div>
              {
                userTokenClaim > 0n &&
                <div className='listing-fixed-width' style={{ paddingBottom: '3em', margin: '2em auto' }}>
                  <div style={{ fontWeight: "bold" }}>Claim ${symbol}</div>
                  <div style={{ fontSize: '.75em', marginTop: '.5em', marginBottom: '.5em' }}>
                    <p>Your connected wallet is eligible to claim {Number(formatUnits(userTokenClaim, 18)).toLocaleString()} ${symbol}.</p>
                    <p style={{ marginTop: '.5em' }}>If you contributed from more than one wallet, connect each wallet individually to claim below</p>
                  </div>
                  {
                    hasClaimed ? (
                      <button
                        style={{ marginTop: '1em' }}
                        className="claim-button"
                        disabled
                      >
                        Claimed
                      </button>
                    ) : (
                      <button
                        style={{ marginTop: '1em' }}
                        className="claim-button"
                        disabled={claiming}
                        onClick={claim}
                      >
                        {claiming ? 'Claiming' : 'Claim'}
                      </button>
                    )
                  }
                </div>
              }
              <div className='listing-width' style={{ paddingBottom: '3em', margin: '2em auto' }}>
                <h2>{symbol ? `Ticker: $${symbol} ` : 'Ticker'}</h2>
                <iframe
                  className="dexscreener-iframe"
                  style={{ borderRadius: '12px', marginTop: '1em' }}
                  src={`https://dexscreener.com/base/${token}?${options.join('&')}`}
                />
              </div>
            </div>
          ) : (
            <div className='listing-fixed-width' style={{ paddingBottom: '3em', margin: '2em auto' }}>
              <div style={{ fontWeight: 'bold' }}>Want to trade this app?</div>
              <div style={{ fontSize: '.75em', marginTop: '.5em' }}>
                <p>The creator can launch an appcoin on Farstore</p>
                <p>If they do, funders get in at the floor price</p>
                <p>Any funds are 100% refundable prior to launch</p>
              </div>
              <div className="flex" style={{ alignItems: 'center', marginTop: '1em' }}>
                <input
                  className="text-input flex-grow"
                  style={{ width: '100%', textAlign: 'right' }}
                  value={fundInput}
                  placeholder="0.0"
                  onChange={e => setFundInput(e.target.value)}
                />
                <div className="flex-shrink" style={{ margin: '0 1em' }}>ETH</div>
              </div>
              <button
                style={{ marginTop: '1em' }}
                className="claim-button flex-shrink"
                disabled={funding}
                onClick={fund}
              >
                {funding ? 'Funding' : 'Fund'}
              </button>
            </div>
          )
        }
        {
          funders.length > 0 && (showContributions || needsRefund) &&
          <div className='listing-fixed-width' style={{ margin: '1em auto' }}>
            {
              needsRefund ? (
                <div style={{ fontWeight: 'bold' }}>Launched elsewhere, claim refund</div>
              ) : (
                <div style={{ fontWeight: 'bold' }}>Funders</div>
              )
            }
            {
              funders.map((funder, i) => {
                if (funds[i] == 0n) {
                  return null;
                }
                return (
                  <div className="flex" key={`funder-${funder}`}>
                    <div className="flex-grow"><Username address={funder || ''} /></div>
                    {
                      funder == userAddress && deployer == getNullAddress() &&
                      <button
                        className="flex-shrink"
                        onClick={refund}
                        disabled={refunding}
                        style={{ padding: '0 .5em' }}
                      >
                        {
                          refunding ? (
                            <div className="loading-spinner-bg loading-spinner" />
                          ) : '❌'
                        }
                      </button>
                    }
                    <div className="flex-shrink" style={{ textAlign: 'right' }}>
                      {prettyPrint(formatUnits(funds[i], 18), 4)}
                    </div>
                  </div>
                )
              })
            }
          </div>
        }
      </div>
    </div>
  );
}
