import { Helmet } from "react-helmet-async";
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "../../lib/site";

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const Seo = ({
  title,
  description,
  path,
  image,
  jsonLd,
  noindex,
}: SeoProps) => {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : SITE_NAME;
  const metaDescription = description ?? SITE_DESCRIPTION;
  const canonical = `${SITE_URL}${path ?? "/"}`;
  const ogImage = image ?? DEFAULT_OG_IMAGE;
  const absoluteImage = ogImage.startsWith("http")
    ? ogImage
    : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      {noindex && <meta name="robots" content="noindex" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      <link rel="canonical" href={canonical} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, "\\u003c")}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
