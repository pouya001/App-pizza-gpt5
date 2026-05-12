import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import siteConfig from "@/data/site-config.json";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: "Retouches Tomberg — Couture & Retouches à Woluwe-Saint-Lambert | Cuir, Daim, Rideaux",
  description:
    "Atelier de retouches et couture à Woluwe-Saint-Lambert (Tomberg 93). Ourlets, ajustements, réparation cuir & daim, rideaux. Hommes, femmes, enfants. ☎ 02 772 63 40",
  keywords: [
    "retouches Woluwe",
    "couture Woluwe-Saint-Lambert",
    "ourlet pantalon Bruxelles",
    "réparation cuir Bruxelles",
    "retouches Tomberg",
    "atelier couture Bruxelles",
    "réparation daim Woluwe",
    "rideaux retouches Bruxelles",
  ],
  authors: [{ name: "Retouches Tomberg" }],
  openGraph: {
    type: "website",
    locale: "fr_BE",
    alternateLocale: ["nl_BE"],
    url: siteConfig.siteUrl,
    siteName: siteConfig.name,
    title: "Retouches Tomberg — Couture & Retouches à Woluwe-Saint-Lambert",
    description:
      "Atelier de retouches et couture à Woluwe-Saint-Lambert. Ourlets, ajustements, cuir & daim, rideaux. ☎ 02 772 63 40",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Retouches Tomberg — Atelier de couture à Woluwe-Saint-Lambert",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Retouches Tomberg — Couture & Retouches à Woluwe-Saint-Lambert",
    description:
      "Atelier de retouches et couture à Woluwe-Saint-Lambert. Ourlets, ajustements, cuir & daim, rideaux.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.siteUrl,
    languages: {
      "fr-BE": `${siteConfig.siteUrl}/fr`,
      "nl-BE": `${siteConfig.siteUrl}/nl`,
    },
  },
};

const schemaOrgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingAlterationService",
  name: siteConfig.name,
  image: `${siteConfig.siteUrl}/og.jpg`,
  url: siteConfig.siteUrl,
  telephone: siteConfig.phones[0].number,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: siteConfig.geo.latitude,
    longitude: siteConfig.geo.longitude,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:30",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "10:00",
      closes: "17:00",
    },
  ],
  priceRange: siteConfig.priceRange,
  areaServed: siteConfig.areaServed.map((area) => ({
    "@type": "City",
    name: area,
  })),
  hasMap: siteConfig.googleMapsUrl,
  currenciesAccepted: "EUR",
  paymentAccepted: "Cash, Credit Card",
  description:
    "Atelier de couture et retouches spécialisé dans le cuir, le daim et les rideaux. Ourlets, ajustements, réparations sur tous vêtements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
