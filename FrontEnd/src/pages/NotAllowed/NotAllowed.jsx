import React from 'react';
import './NotAllowed.css';

export default function NotAllowed() {
return (
<div className="not-allowed-page">
<div className="na-card" role="region" aria-labelledby="na-title" aria-describedby="na-desc">
<div className="na-illustration" aria-hidden="true">
{/* simple lock SVG */}
<svg width="96" height="96" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="3" y="11" width="18" height="10" rx="2" stroke="var(--primary)" strokeWidth="1.5" fill="white" />
<path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="var(--product-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
<circle cx="12" cy="16" r="1.2" fill="var(--primary)" />
</svg>
</div>

<h1 id="na-title" className="na-title">Access Denied</h1>

<p id="na-desc" className="na-subtitle">
You are not permitted to view this page. Please contact our team for access.
</p>

<div className="na-actions">
<a className="na-button" href="mailto:support@omniedu.com">Contact Support</a>
<a className="na-link" href="/">Return Home</a>
</div>

</div>
</div>
);
}