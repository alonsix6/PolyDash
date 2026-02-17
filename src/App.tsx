import { useState } from 'react';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'signals':
        return (
          <div className="text-center text-gray-500 py-20">
            Signals page - Coming soon
          </div>
        );
      case 'wallets':
        return (
          <div className="text-center text-gray-500 py-20">
            Wallets page - Coming soon
          </div>
        );
      case 'settings':
        return (
          <div className="text-center text-gray-500 py-20">
            Settings page - Coming soon
          </div>
        );
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="pt-20 pb-8 px-4 max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
