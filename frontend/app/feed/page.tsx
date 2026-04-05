import FeedClient from "../../components/feed/FeedClient";
import Script from "next/script";


export default function FeedPage() {
  return (
    <>
      <FeedClient />
      <Script src="/buddy-script/assets/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/buddy-script/assets/js/custom.js" strategy="afterInteractive" />
    </>
  );
}
