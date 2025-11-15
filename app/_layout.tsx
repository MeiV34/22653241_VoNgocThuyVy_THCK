import { useEffect } from 'react';
import { initDB } from './db';
import { Stack } from "expo-router";

export default function RootLayout() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <Stack />
  );
}
