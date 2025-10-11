import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-accent-50">
      <Header />
      {children}
    </div>
  );
}