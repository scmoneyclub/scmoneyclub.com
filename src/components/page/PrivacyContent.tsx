"use client";

export default function PrivacyContent() {
  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto space-y-8 text-gray-300">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Introduction</h2>
          <p>
            SC Money Club (we, us, our) is committed to protecting your privacy. This
            Privacy Policy explains the types of information we collect when you use our
            applications and services (the Services), including our website and any integrated
            applications, and how we use, share, and protect that information.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
          <div className="space-y-2">
            <h3 className="font-medium text-white">1) Account & Login Data</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Identifiers such as name, email address, and username (if provided).</li>
              <li>Authentication data such as password hashes (never stored in plain text).</li>
              <li>Login metadata such as timestamps, IP address, device/browser information.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-white">2) Connected Crypto Wallet Data</h3>
            <p>
              If you connect a supported crypto wallet (e.g., Phantom), we may process the following
              to provide wallet-related features:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Public wallet address (public key).</li>
              <li>On-chain publicly available balance and token holdings for the connected address.</li>
              <li>Wallet connection state and non-custodial signatures required for authentication or transactions.</li>
            </ul>
            <p className="text-sm text-gray-400">
              We do not request or store your private keys. You remain in full control of your wallet.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-white">3) Usage & Technical Data</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Pages viewed, features used, referral URLs, and session analytics.</li>
              <li>Cookies or similar technologies for authentication and session continuity.</li>
            </ul>
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To create and manage your account and provide the Services.</li>
            <li>To authenticate you and secure access to restricted features.</li>
            <li>To enable wallet connectivity, verify ownership (via signed messages), and show balances or assets.</li>
            <li>To improve, operate, and maintain performance and reliability of our applications.</li>
            <li>To comply with legal obligations and enforce our terms and policies.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Legal Bases for Processing</h2>
          <p>
            Where applicable, we process your information based on one or more of the following legal
            bases: performance of a contract, legitimate interests (such as security and service
            improvement), compliance with legal obligations, and your consent where required.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Sharing of Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Service Providers: We may share limited information with vendors who help us operate our
              Services (e.g., hosting, analytics, email), under confidentiality and data protection
              commitments.
            </li>
            <li>
              Legal & Compliance: We may disclose information if required by law, regulation, or legal
              process, or to protect rights, safety, or security.
            </li>
            <li>
              Business Transfers: In the event of a merger, acquisition, or asset sale, information may
              be transferred as part of the transaction.
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Data Retention</h2>
          <p>
            We retain information for as long as necessary to provide the Services, comply with legal
            obligations, resolve disputes, and enforce agreements. Wallet-related data typically
            consists of public addresses and derived, publicly available on-chain information and is
            retained only as needed to provide features or meet compliance requirements.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Security</h2>
          <p>
            We implement technical and organizational measures designed to protect your information.
            However, no system is completely secure. You are responsible for maintaining control of
            your wallet and devices and for safeguarding your authentication factors.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Your Rights & Choices</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Access, update, or delete your account information where applicable.</li>
            <li>Disconnect your wallet at any time via your wallet provider.</li>
            <li>Manage cookie and tracking preferences in your browser settings.</li>
            <li>
              Depending on your jurisdiction, you may have additional privacy rights (e.g., data
              portability, objection, restriction). Contact us to exercise these rights.
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Children’s Privacy</h2>
          <p>
            Our Services are not directed to children under 13 (or the relevant age in your
            jurisdiction), and we do not knowingly collect personal information from children.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">International Transfers</h2>
          <p>
            We may process and store information in countries other than your own. Where required, we
            implement appropriate safeguards for international data transfers.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated version on
            this page and adjust the Last updated date. If changes are material, we may provide
            additional notice as required by law.
          </p>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at
            <span className="ml-1 text-white font-medium">privacy@scmoneyclub.com</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
