import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Disclaimer | SettleRadar',
  description: 'Privacy policy and legal disclaimers for SettleRadar.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
      <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/20 dark:border-white/10 shadow-xl prose dark:prose-invert max-w-none">
        
        <h1 className="text-4xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400">
          Privacy Policy & Legal Disclaimer
        </h1>
        
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">1. Legal Disclaimer (Liability Limitation)</h2>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-900 dark:text-amber-200 rounded-r-lg">
            <strong>USE AT YOUR OWN RISK.</strong> SettleRadar is a data aggregation tool designed for informational and orientational purposes only. 
            We are not tax advisors, immigration lawyers, or financial consultants. Any decisions made based on the data provided on this website are made entirely at your own risk.
          </div>
          <p>
            The data presented on SettleRadar is sourced from various external third-party providers (including, but not limited to, The World Bank, Heritage Foundation, WHO, and Wikipedia). 
            While we strive for accuracy, we cannot guarantee the correctness, completeness, or timeliness of the information. Data points may contain errors, be outdated, or be misinterpreted during the aggregation process.
            SettleRadar and its creators shall not be held liable for any financial losses, legal issues, tax complications, or damages resulting from the use or inability to use this website.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">1.5. Data Licensing &amp; Open Data</h2>
          <p>
            All datasets aggregated and visualized on SettleRadar are sourced from publicly available Open Data repositories. Data providers such as The World Bank, UN DESA, the World Health Organization, and Wikipedia release their datasets under permissive licenses, including <strong>Creative Commons Attribution (CC BY 4.0 / CC BY-SA)</strong> or public domain dedications. 
          </p>
          <p>
            Data referenced from The Heritage Foundation (Index of Economic Freedom) is publicly available and utilized under the <strong>Fair Use</strong> doctrine (or equivalent factual data extraction exceptions) exclusively for informational, non-commercial comparative purposes.
          </p>
          <p>
            SettleRadar operates in full compliance with these licenses by aggregating factual data points without claiming ownership of the underlying proprietary rights, and by providing appropriate attribution to the original organizations.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">2. AI-Generated Content</h2>
          <p>
            Some textual summaries, comparisons, and insights provided on this platform are algorithmically generated using Artificial Intelligence (AI) models. 
            AI-generated content is prone to "hallucinations," inaccuracies, and logical errors. Users must independently verify all critical information (especially regarding taxes, visas, and legal rights) with official government sources or certified professionals.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">3. Data Collection and Privacy</h2>
          <p>
            We value your privacy. SettleRadar collects minimal data to ensure the proper functioning and improvement of our service.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookieless Tracking:</strong> We utilize Google Analytics via Google Consent Mode v2. By default, your visit is tracked anonymously without storing any cookies on your device (cookieless pings) to comply with GDPR and ePrivacy directives.</li>
            <li><strong>Cookies:</strong> Only upon your explicit consent (clicking "Accept" on our banner) will full tracking cookies be deployed to analyze usage patterns and improve our platform.</li>
            <li><strong>Personal Data:</strong> We do not collect, store, or sell any personally identifiable information (PII) such as names, emails, or exact physical addresses, unless explicitly provided by you (e.g., through a contact form).</li>
          </ul>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">4. External Links</h2>
          <p>
            Our website may contain links to external sites that are not operated by us. We have no control over the content and practices of these sites and cannot accept responsibility or liability for their respective privacy policies.
          </p>
        </section>

      </div>
    </div>
  );
}
