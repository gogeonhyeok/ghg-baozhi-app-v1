import Create from '../create';
import Link from 'next/link';

export default () => {
  return (
    <>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          margin: 16
        }}
      >
        <Link href="/serial">List</Link>
        <Link href="/">Home</Link>

      </nav>
      <Create />
    </>
  );
}
