/** Renders JSON-LD safely: "<" is escaped so content can never close the script tag. */
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/\u2028|\u2029/g, "");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
