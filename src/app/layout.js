import Navbar from '@/components/navbar/Navbar'
import './globals.css'
import { Inter, Roboto, Poppins, Montserrat  } from 'next/font/google';
import Footer from '@/components/footer/Footer';
import { ThemeProvider } from '@/context/ThemeContext';
import AuthProvider from '@/components/AuthProvider/AuthProvider';
import { UserContext, UserProvider } from '@/context/UserContext';
import "primereact/resources/themes/lara-light-indigo/theme.css";  // Choose the desired theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const inter = Inter({ subsets: ['latin'] })
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata = {
  title: 'StarHire Adminstrative Portal',
  description: 'Portal for Administrators and Recruiters of StarHire',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <div className="container">
                <Navbar />
                {children}
                <Footer />
              </div>
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
