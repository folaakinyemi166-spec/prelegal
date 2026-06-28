export interface PartyDetails {
  company: string;
  printName: string;
  title: string;
  noticeAddress: string;
}

export type MNDATermType = "expires" | "continues";
export type ConfidentialityTermType = "years" | "perpetuity";

export interface NDAFormData {
  purpose: string;
  effectiveDate: string;
  mndaTermType: MNDATermType;
  mndaTermYears: string;
  confidentialityTermType: ConfidentialityTermType;
  confidentialityTermYears: string;
  governingLaw: string;
  jurisdiction: string;
  modifications: string;
  party1: PartyDetails;
  party2: PartyDetails;
}

export const defaultFormData: NDAFormData = {
  purpose: "Evaluating whether to enter into a business relationship with the other party.",
  effectiveDate: new Date().toISOString().split("T")[0],
  mndaTermType: "expires",
  mndaTermYears: "1",
  confidentialityTermType: "years",
  confidentialityTermYears: "1",
  governingLaw: "",
  jurisdiction: "",
  modifications: "",
  party1: { company: "", printName: "", title: "", noticeAddress: "" },
  party2: { company: "", printName: "", title: "", noticeAddress: "" },
};
