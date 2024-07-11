import React from 'react';
import styles from './LoadingScreen.module.css';

const LoadingScreen = () => {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.chessboard}>
        <div className={styles.knight}></div>
      </div>
      <p className={styles.loadingText}>Loading</p>
    </div>
  );
};

export default LoadingScreen;