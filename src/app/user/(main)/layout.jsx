import Footer from "../components/Footer";
import Header from "../components/Header";
// SEO + Favicon
export const metadata = {
  title: "XOXOFX",
  description: "Trading",
  icons: {
    icon: "/favicon.png",  
    shortcut: "/faviocn.png",
    apple: "/faviocn.png",
  },
};

export default function MainLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}