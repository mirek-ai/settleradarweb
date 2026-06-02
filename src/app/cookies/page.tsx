import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy | SettleRadar',
  description: 'Information about how SettleRadar uses cookies and tracking technologies.',
};

export default function CookiePolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl prose dark:prose-invert max-w-none">
        
        <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          Cookie Policy
        </h1>
        
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. What are cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device by websites that you visit. 
            They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">2. How we use cookies</h2>
          <p>
            At SettleRadar, we prioritize your privacy. By default, we operate using a <strong>Cookieless Tracking</strong> model. 
            This means when you first visit our site, we do not store any tracking cookies on your device.
          </p>
          <p>
            We use <strong>Google Analytics (GA4)</strong> with <em>Google Consent Mode v2</em>. 
            Before you explicitly accept our cookie banner, GA4 only sends anonymous, cookie-less pings to help us measure basic traffic volumes without identifying you or tracking your behavior across sessions.
          </p>
          <p>
            If you choose to click "Accept" on our banner, we will then use standard Google Analytics cookies. These cookies help us understand how you use our site, such as the pages you visit and the links you click, so we can improve the platform.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">3. The cookies we set</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse mt-4">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3">Cookie Name</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 font-mono text-sm">_ga</td>
                  <td className="p-3">Google Analytics</td>
                  <td className="p-3">Used to distinguish users (only after consent is granted).</td>
                  <td className="p-3">2 years</td>
                </tr>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <td className="p-3 font-mono text-sm">_ga_*</td>
                  <td className="p-3">Google Analytics</td>
                  <td className="p-3">Used to maintain session status (only after consent is granted).</td>
                  <td className="p-3">1 year</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-sm">cookie_consent</td>
                  <td className="p-3">SettleRadar</td>
                  <td className="p-3">Saves your cookie consent preference (strictly necessary).</td>
                  <td className="p-3">1 year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">4. Managing your preferences</h2>
          <p>
            You can clear your cookies or change your browser settings at any time to block or delete cookies.
            For more information on how to manage cookies on popular browsers, please visit the respective support pages for Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge.
          </p>
          <p className="mt-4">
            For more information regarding data protection, please read our <Link href="/privacy" className="text-blue-500 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
