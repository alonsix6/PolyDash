import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { PageTransition } from './components/PageTransition';
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
      <main style={{ paddingTop: '80px' }} className="pb-12 px-5 sm:px-8 lg:px-12 xl:px-16">
        <AnimatePresence mode="wait">
          <PageTransition pageKey={currentPage}>
            {renderPage()}
          </PageTransition>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
