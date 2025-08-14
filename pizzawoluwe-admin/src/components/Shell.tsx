import Sidebar from './Sidebar';
import Header from './Header';

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      
      {/* Contenu principal responsive */}
      <main className="
        ml-0 md:ml-64          
        mt-14                  
        p-3 md:p-6            
        min-h-screen
        overflow-x-auto
      ">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
