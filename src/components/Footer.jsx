import React from 'react'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          with love and gratitude<br />
          <span className="footer-names">brisa & v.c.</span>
        </p>
        <div className="footer-divider"></div>
        <p className="footer-year">
          <span>2025</span>
          <span className="footer-birth-year">baby arriving 2026</span>
          <span className="footer-credit">front-end and back-end done by v.c.</span>
        </p>
        <p className="footer-konami">
          ↑ ↑ ↓ ↓ ← → ← → B A
        </p>
      </div>
    </footer>
  )
}

export default Footer

