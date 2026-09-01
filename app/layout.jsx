import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { AuthProvider } from "@/lib/auth-context"
import NextAuthProvider from "@/components/auth-provider"
import FloatingSpamCheck from "@/components/floating-spam-check"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NextAuthProvider>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <FloatingSpamCheck />
            </LanguageProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.app'
    };
