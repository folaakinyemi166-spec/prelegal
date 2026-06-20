"use client";

import { NDAFormData } from "@/lib/nda-types";

function blank(value: string, placeholder: string) {
  return value.trim()
    ? value
    : `[${placeholder}]`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "[Date]";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

interface Props {
  data: NDAFormData;
}

export function NDAPreview({ data }: Props) {
  const p1 = data.party1;
  const p2 = data.party2;

  const mndaTermText =
    data.mndaTermType === "expires"
      ? `Expires ${blank(data.mndaTermYears, "N")} year(s) from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confTermText =
    data.confidentialityTermType === "years"
      ? `${blank(data.confidentialityTermYears, "N")} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  const governingLaw = blank(data.governingLaw, "Fill in state");
  const jurisdiction = blank(data.jurisdiction, "Fill in city or county and state");

  return (
    <div id="nda-document" className="font-serif text-gray-900 text-sm leading-relaxed">
      {/* Cover Page */}
      <h1 className="text-2xl font-bold text-center mb-2">Mutual Non-Disclosure Agreement</h1>

      <div className="border-t border-gray-300 my-4" />

      <p className="text-xs text-gray-600 mb-6">
        This Mutual Non-Disclosure Agreement (the &ldquo;MNDA&rdquo;) consists of: (1) this Cover Page
        (&ldquo;<strong>Cover Page</strong>&rdquo;) and (2) the Common Paper Mutual NDA Standard Terms Version 1.0
        (&ldquo;<strong>Standard Terms</strong>&rdquo;) identical to those posted at{" "}
        <a
          href="https://commonpaper.com/standards/mutual-nda/1.0"
          className="text-blue-600 underline"
          target="_blank"
          rel="noreferrer"
        >
          commonpaper.com/standards/mutual-nda/1.0
        </a>
        . Any modifications of the Standard Terms should be made on the Cover Page, which will control over conflicts
        with the Standard Terms.
      </p>

      {/* Cover Page fields */}
      <div className="space-y-5">
        <CoverField title="Purpose" subtitle="How Confidential Information may be used">
          <p>{blank(data.purpose, "How Confidential Information may be used")}</p>
        </CoverField>

        <CoverField title="Effective Date">
          <p>{formatDate(data.effectiveDate)}</p>
        </CoverField>

        <CoverField title="MNDA Term" subtitle="The length of this MNDA">
          <p>
            <CheckBox checked={data.mndaTermType === "expires"} /> {" "}
            {data.mndaTermType === "expires"
              ? <strong>{mndaTermText}</strong>
              : mndaTermText}
          </p>
          <p className="mt-1">
            <CheckBox checked={data.mndaTermType === "continues"} /> {" "}
            {data.mndaTermType === "continues"
              ? <strong>{mndaTermText}</strong>
              : "Continues until terminated in accordance with the terms of the MNDA."}
          </p>
        </CoverField>

        <CoverField title="Term of Confidentiality" subtitle="How long Confidential Information is protected">
          <p>
            <CheckBox checked={data.confidentialityTermType === "years"} /> {" "}
            {data.confidentialityTermType === "years"
              ? <strong>{confTermText}</strong>
              : `${blank(data.confidentialityTermYears, "N")} year(s) from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`}
          </p>
          <p className="mt-1">
            <CheckBox checked={data.confidentialityTermType === "perpetuity"} /> {" "}
            {data.confidentialityTermType === "perpetuity"
              ? <strong>In perpetuity.</strong>
              : "In perpetuity."}
          </p>
        </CoverField>

        <CoverField title="Governing Law &amp; Jurisdiction">
          <p>
            <strong>Governing Law:</strong> {governingLaw}
          </p>
          <p>
            <strong>Jurisdiction:</strong> {jurisdiction}
          </p>
        </CoverField>

        <CoverField title="MNDA Modifications">
          {data.modifications.trim() ? (
            <p className="whitespace-pre-wrap">{data.modifications}</p>
          ) : (
            <p className="text-gray-400 italic">None</p>
          )}
        </CoverField>
      </div>

      <p className="mt-6 mb-4 text-sm">
        By signing this Cover Page, each party agrees to enter into this MNDA as of the Effective Date.
      </p>

      {/* Signature table */}
      <table className="w-full border-collapse text-sm mb-8">
        <thead>
          <tr>
            <th className="border border-gray-400 px-3 py-2 text-left w-1/3 bg-gray-50"></th>
            <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">PARTY 1</th>
            <th className="border border-gray-400 px-3 py-2 text-center bg-gray-50">PARTY 2</th>
          </tr>
        </thead>
        <tbody>
          <SigRow label="Signature" v1="" v2="" isSignature />
          <SigRow label="Print Name" v1={p1.printName} v2={p2.printName} />
          <SigRow label="Title" v1={p1.title} v2={p2.title} />
          <SigRow label="Company" v1={p1.company} v2={p2.company} />
          <SigRow label="Notice Address" v1={p1.noticeAddress} v2={p2.noticeAddress} />
          <SigRow label="Date" v1={formatDate(data.effectiveDate)} v2={formatDate(data.effectiveDate)} />
        </tbody>
      </table>

      <p className="text-xs text-gray-500 mb-8">
        Common Paper Mutual Non-Disclosure Agreement (Version 1.0) free to use under{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" className="text-blue-600 underline" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
        .
      </p>

      {/* Standard Terms */}
      <div className="border-t-2 border-gray-400 pt-6">
        <h2 className="text-xl font-bold mb-4">Standard Terms</h2>
        <div className="space-y-4 text-sm">
          <StandardTerm num={1} title="Introduction">
            This Mutual Non-Disclosure Agreement (which incorporates these Standard Terms and the Cover Page (defined
            below)) (&ldquo;<strong>MNDA</strong>&rdquo;) allows each party (&ldquo;<strong>Disclosing Party</strong>
            &rdquo;) to disclose or make available information in connection with the{" "}
            <CoverpageRef>Purpose</CoverpageRef> which (1) the Disclosing Party identifies to the receiving party
            (&ldquo;<strong>Receiving Party</strong>&rdquo;) as &ldquo;confidential&rdquo;, &ldquo;proprietary&rdquo;,
            or the like or (2) should be reasonably understood as confidential or proprietary due to its nature and the
            circumstances of its disclosure (&ldquo;<strong>Confidential Information</strong>&rdquo;). Each party&apos;s
            Confidential Information also includes the existence and status of the parties&apos; discussions and
            information on the Cover Page. Confidential Information includes technical or business information, product
            designs or roadmaps, requirements, pricing, security and compliance documentation, technology, inventions and
            know-how. To use this MNDA, the parties must complete and sign a cover page incorporating these Standard
            Terms (&ldquo;<strong>Cover Page</strong>&rdquo;). Each party is identified on the Cover Page and
            capitalized terms have the meanings given herein or on the Cover Page.
          </StandardTerm>

          <StandardTerm num={2} title="Use and Protection of Confidential Information">
            The Receiving Party shall: (a) use Confidential Information solely for the{" "}
            <CoverpageRef>Purpose</CoverpageRef>; (b) not disclose Confidential Information to third parties without the
            Disclosing Party&apos;s prior written approval, except that the Receiving Party may disclose Confidential
            Information to its employees, agents, advisors, contractors and other representatives having a reasonable
            need to know for the <CoverpageRef>Purpose</CoverpageRef>, provided these representatives are bound by
            confidentiality obligations no less protective of the Disclosing Party than the applicable terms in this
            MNDA and the Receiving Party remains responsible for their compliance with this MNDA; and (c) protect
            Confidential Information using at least the same protections the Receiving Party uses for its own similar
            information but no less than a reasonable standard of care.
          </StandardTerm>

          <StandardTerm num={3} title="Exceptions">
            The Receiving Party&apos;s obligations in this MNDA do not apply to information that it can demonstrate:
            (a) is or becomes publicly available through no fault of the Receiving Party; (b) it rightfully knew or
            possessed prior to receipt from the Disclosing Party without confidentiality restrictions; (c) it rightfully
            obtained from a third party without confidentiality restrictions; or (d) it independently developed without
            using or referencing the Confidential Information.
          </StandardTerm>

          <StandardTerm num={4} title="Disclosures Required by Law">
            The Receiving Party may disclose Confidential Information to the extent required by law, regulation or
            regulatory authority, subpoena or court order, provided (to the extent legally permitted) it provides the
            Disclosing Party reasonable advance notice of the required disclosure and reasonably cooperates, at the
            Disclosing Party&apos;s expense, with the Disclosing Party&apos;s efforts to obtain confidential treatment
            for the Confidential Information.
          </StandardTerm>

          <StandardTerm num={5} title="Term and Termination">
            This MNDA commences on the <CoverpageRef>Effective Date</CoverpageRef> and expires at the end of the{" "}
            <CoverpageRef>MNDA Term</CoverpageRef>. Either party may terminate this MNDA for any or no reason upon
            written notice to the other party. The Receiving Party&apos;s obligations relating to Confidential
            Information will survive for the <CoverpageRef>Term of Confidentiality</CoverpageRef>, despite any
            expiration or termination of this MNDA.
          </StandardTerm>

          <StandardTerm num={6} title="Return or Destruction of Confidential Information">
            Upon expiration or termination of this MNDA or upon the Disclosing Party&apos;s earlier request, the
            Receiving Party will: (a) cease using Confidential Information; (b) promptly after the Disclosing Party
            &apos;s written request, destroy all Confidential Information in the Receiving Party&apos;s possession or
            control or return it to the Disclosing Party; and (c) if requested by the Disclosing Party, confirm its
            compliance with these obligations in writing. As an exception to subsection (b), the Receiving Party may
            retain Confidential Information in accordance with its standard backup or record retention policies or as
            required by law, but the terms of this MNDA will continue to apply to the retained Confidential Information.
          </StandardTerm>

          <StandardTerm num={7} title="Proprietary Rights">
            The Disclosing Party retains all of its intellectual property and other rights in its Confidential
            Information and its disclosure to the Receiving Party grants no license under such rights.
          </StandardTerm>

          <StandardTerm num={8} title="Disclaimer">
            ALL CONFIDENTIAL INFORMATION IS PROVIDED &ldquo;AS IS&rdquo;, WITH ALL FAULTS, AND WITHOUT WARRANTIES,
            INCLUDING THE IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
          </StandardTerm>

          <StandardTerm num={9} title="Governing Law and Jurisdiction">
            This MNDA and all matters relating hereto are governed by, and construed in accordance with, the laws of the
            State of <CoverpageRef>{governingLaw}</CoverpageRef>, without regard to the conflict of laws provisions of
            such <CoverpageRef>{governingLaw}</CoverpageRef>. Any legal suit, action, or proceeding relating to this
            MNDA must be instituted in the federal or state courts located in{" "}
            <CoverpageRef>{jurisdiction}</CoverpageRef>. Each party irrevocably submits to the exclusive jurisdiction of
            such <CoverpageRef>{jurisdiction}</CoverpageRef> in any such suit, action, or proceeding.
          </StandardTerm>

          <StandardTerm num={10} title="Equitable Relief">
            A breach of this MNDA may cause irreparable harm for which monetary damages are an insufficient remedy. Upon
            a breach of this MNDA, the Disclosing Party is entitled to seek appropriate equitable relief, including an
            injunction, in addition to its other remedies.
          </StandardTerm>

          <StandardTerm num={11} title="General">
            Neither party has an obligation under this MNDA to disclose Confidential Information to the other or proceed
            with any proposed transaction. Neither party may assign this MNDA without the prior written consent of the
            other party, except that either party may assign this MNDA in connection with a merger, reorganization,
            acquisition or other transfer of all or substantially all its assets or voting securities. Any assignment in
            violation of this Section is null and void. This MNDA will bind and inure to the benefit of each party
            &apos;s permitted successors and assigns. Waivers must be signed by the waiving party&apos;s authorized
            representative and cannot be implied from conduct. If any provision of this MNDA is held unenforceable, it
            will be limited to the minimum extent necessary so the rest of this MNDA remains in effect. This MNDA
            (including the Cover Page) constitutes the entire agreement of the parties with respect to its subject
            matter, and supersedes all prior and contemporaneous understandings, agreements, representations, and
            warranties, whether written or oral, regarding such subject matter. This MNDA may only be amended, modified,
            waived, or supplemented by an agreement in writing signed by both parties. Notices, requests and approvals
            under this MNDA must be sent in writing to the email or postal addresses on the Cover Page and are deemed
            delivered on receipt. This MNDA may be executed in counterparts, including electronic copies, each of which
            is deemed an original and which together form the same agreement.
          </StandardTerm>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Common Paper Mutual Non-Disclosure Agreement{" "}
          <a
            href="https://commonpaper.com/standards/mutual-nda/1.0/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noreferrer"
          >
            Version 1.0
          </a>{" "}
          free to use under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            className="text-blue-600 underline"
            target="_blank"
            rel="noreferrer"
          >
            CC BY 4.0
          </a>
          .
        </p>
      </div>
    </div>
  );
}

function CoverField({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-bold text-sm">
        {title}
        {subtitle && <span className="font-normal text-gray-500 text-xs ml-1">— {subtitle}</span>}
      </h3>
      <div className="mt-1 pl-2 border-l-2 border-gray-200 text-sm">{children}</div>
    </div>
  );
}

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <span className="inline-block w-4 h-4 border border-gray-500 text-center text-xs leading-4 align-middle mr-1">
      {checked ? "✓" : " "}
    </span>
  );
}

function SigRow({
  label,
  v1,
  v2,
  isSignature,
}: {
  label: string;
  v1: string;
  v2: string;
  isSignature?: boolean;
}) {
  const cellHeight = isSignature ? "h-10" : "h-7";
  return (
    <tr>
      <td className={`border border-gray-400 px-3 py-1 font-medium bg-gray-50 text-xs ${cellHeight}`}>{label}</td>
      <td className={`border border-gray-400 px-3 py-1 text-xs ${cellHeight}`}>{v1}</td>
      <td className={`border border-gray-400 px-3 py-1 text-xs ${cellHeight}`}>{v2}</td>
    </tr>
  );
}

function StandardTerm({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <p>
      <strong>
        {num}. {title}.
      </strong>{" "}
      {children}
    </p>
  );
}

function CoverpageRef({ children }: { children: React.ReactNode }) {
  return <em className="text-blue-800 not-italic underline decoration-dotted">{children}</em>;
}
