
import Sidebar from './Sidebar';
import Header from './Header';
export default function Shell({ children }: { children: React.ReactNode }) {
  return (<div><Sidebar /><Header /><main className="ml-64 mt-14 p-6">{children}</main></div>);
}
