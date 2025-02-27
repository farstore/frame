import axios from "axios";
import { Address } from "viem";

interface FrameMetadata {
  name: string;
  iconUrl: string;
  homeUrl: string;
}

interface FrameVerification {
  domain: string;
  eligibleOwners: string[];
  signature: string;
}

export const getFrame = async (domain: string) => {
  const { data } = await axios.get(`/api/frame?domain=${domain}`);
  console.log(data);
  return data as FrameMetadata;
};

export const verifyFrame = async (domain: string) => {
  const { data } = await axios.get(`/api/verify-frame?domain=${domain}`);
  console.log(data);
  return data as FrameVerification;
};

export const getNullAddress = () => "0x0000000000000000000000000000000000000000" as Address;

export const getAppUrl = () => process.env.NEXT_PUBLIC_URL as string;
