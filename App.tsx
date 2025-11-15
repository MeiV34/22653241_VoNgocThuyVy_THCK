import { useEffect } from 'react';
import { initDatabase } from './db';

export default function App() {
  useEffect(() => {
    initDatabase();
  }, []);

  return null; // sẽ thêm UI sau Q3
}
