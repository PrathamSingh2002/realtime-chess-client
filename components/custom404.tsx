import React from 'react';
import Link from 'next/link';
import styles from './404.module.css';
const Custom404 = () => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.chessboard}>
        <div className={styles.piece}>♞</div>
      </div>
      <h1 className={styles.errorTitle}>404</h1>
      <p className={styles.errorMessage}>Oops! This page is off the board.</p>
      <Link href="/" className={styles.homeLink}>
        Return to Home
      </Link>
    </div>
  );
};

export default Custom404;