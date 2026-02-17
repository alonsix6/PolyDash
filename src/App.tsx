import { useState } from 'react';
import { Header } from './components/Header';
import { Overview } from './pages/Overview';
import { Signals } from './pages/Signals';
import { Wallets } from './pages/Wallets';
import { Settings } from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('overview');

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'signals':
        return <Signals />;
      case 'wallets':
        return <Wallets />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="pt-18 pb-8 px-4 max-w-[1440px] mx-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
