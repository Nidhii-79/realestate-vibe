import { inr } from '@/lib/format';

export default function ListingCard({ l }) {
  return (
    <article className="card">
      {l.similarity != null && <span className="match">{Math.round(l.similarity * 100)}% vibe match</span>}
      <h3><a href={`/listings/${l.listing_id}`}>{l.title}</a></h3>
      <div className="price">{inr(l.price)}</div>
      <div className="meta">
        {l.bedrooms} bed · {l.neighborhood}{l.property_type ? ` · ${l.property_type}` : ''}
      </div>
    </article>
  );
}
