import axios from "axios";
import { Address } from "viem";

export interface FrameMetadata {
  name: string;
  iconUrl: string;
  homeUrl: string;
  tagline: string;
  imageUrl: string;
}

export interface AppMetadata {
  domain: string;
  frameId: number;
  frame: FrameMetadata;
  token: string | null;
  liquidity: number;
}

interface FrameVerification {
  domain: string;
  eligibleOwners: string[];
  signature: string;
}

export const getAppByDomain = async (domain: string) => {
  const { data } = await axios.get(`/api/app?domain=${domain}`);
  return data as AppMetadata;
};

export const getApps = async (frameIds: string) => {
  const { data } = await axios.get(`/api/apps?frameIds=${frameIds}`);
  return data as AppMetadata[];
};

export const verifyFrame = async (domain: string) => {
  const { data } = await axios.get(`/api/verify-frame?domain=${domain}`);
  console.log(data);
  return data as FrameVerification;
};

export const getNullAddress = () => "0x0000000000000000000000000000000000000000" as Address;

export const getAppUrl = () => process.env.NEXT_PUBLIC_URL as string;
export const getApiUrl = () => process.env.FARSTORE_API_URL as string;
