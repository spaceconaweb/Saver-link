import "./globals.css";

export const metadata = {
  title: "HubLink",
  description: "Smart Link Management Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
