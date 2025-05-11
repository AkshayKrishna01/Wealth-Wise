import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footer_content}>
        <p>&copy; {new Date().getFullYear()} WealthWise. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
