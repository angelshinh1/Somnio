import Layout from '../components/layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-neutral-800 mb-6">Privacy Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6 text-neutral-700">
          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">1. Information We Collect</h2>
            <p>We collect the following information when you use Somnio:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> Username, email, password (encrypted)</li>
              <li><strong>Dream Content:</strong> Dream descriptions, titles, tags, emotions, dates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">2. How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide and maintain the Somnio service</li>
              <li>Calculate dream similarities and create connections</li>
              <li>Display public dreams to other users</li>
              <li>Improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">3. Public vs Private Dreams</h2>
            <p>
              <strong>Public Dreams:</strong> Visible to all users, included in similarity calculations, displayed in the network visualization.
            </p>
            <p className="mt-2">
              <strong>Private Dreams:</strong> Only visible to you, not included in similarity calculations, not shown to other users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">4. Data Storage</h2>
            <p>
              Your data is stored securely in a Neo4j graph database. Passwords are encrypted using bcrypt hashing. We implement industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">5. Data Sharing</h2>
            <p>We do not sell or share your personal information with third parties. Public dreams are shared with other Somnio users as intended by the platform functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your data at any time</li>
              <li>Edit or delete your dreams</li>
              <li>Change dream visibility (public/private)</li>
              <li>Delete your account and all associated data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">7. Cookies</h2>
            <p>
              We use authentication tokens (JWT) stored in browser local storage to keep you logged in. No tracking cookies are used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">8. Children&apos;s Privacy</h2>
            <p>
              Somnio is not intended for users under 13 years of age. We do not knowingly collect information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">9. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of any significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-800 mb-3">10. Contact</h2>
            <p>
              Questions about this privacy policy? Contact us through our GitHub repository.
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
