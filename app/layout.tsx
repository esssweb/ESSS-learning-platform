import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import StoreProvider from "@/store/storeprovider";
import Footer from "./components/Footer";

const poppins = Poppins({
  subsets: ["latin", "latin-ext", "devanagari"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  preload: true,
});

export const metadata: Metadata = {
  title: "ESSS Learning",
  description: "Learning a new initiative by the Ethiopian Space Science Society (ESSS), dedicated to making space science and technology education accessible to everyone. At ESSS, we're passionate about exploring the mysteries of the cosmos and sharing that knowledge with the world.",
  icons: 'favicon.ico',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={poppins.className}>
          <header>
            <Navbar />
          </header>

          {/* main page content */}
          {children}
          {/* footer component */}
          <Footer/>
        </body>
      </html>
    </StoreProvider>
  );
}
