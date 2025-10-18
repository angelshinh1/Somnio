import Layout from '../components/layout/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-neutral-800 mb-6">Terms & Conditions</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6 text-neutral-700">
          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Somnio, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">2. Use License</h2>
            <p>
              Permission is granted to temporarily use Somnio for personal, non-commercial purposes only. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Creating and managing your dream journal</li>
              <li>Viewing public dreams from other users</li>
              <li>Exploring the 3D network visualization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">3. User Content</h2>
            <p>
              You retain all rights to the dreams and content you post. By marking dreams as &quot;public,&quot; you grant Somnio permission to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Display your dreams to other users</li>
              <li>Analyze dream content to find similarities</li>
              <li>Create connections between related dreams</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">4. User Responsibilities</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post offensive, harmful, or inappropriate content</li>
              <li>Impersonate others or provide false information</li>
              <li>Attempt to access other users&apos; private data</li>
              <li>Use the service for any illegal purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">5. Disclaimer</h2>
            <p>
              Somnio is provided &quot;as is&quot; without any warranties. We do not guarantee the accuracy, completeness, or usefulness of any dream interpretations or connections.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">6. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at any time for violations of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">7. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of Somnio after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">8. Contact</h2>
            <p>
              Questions about these terms? Contact us through our GitHub repository.
            </p>
          </section>

          <p className="text-sm text-neutral-500 mt-8">
            Last updated: October 18, 2025
          </p>
        </div>
      </div>
    </Layout>
  );
}
