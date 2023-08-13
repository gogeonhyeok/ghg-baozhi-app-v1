'use client'
import { listItems } from './actions'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default () => {
  const [articles, setArticles] = useState([])
  useEffect(() => {
    listItems().then(response => setArticles(response))
  }, [])

  return (
    <ul role="list" className="divide-y divide-gray-800">
      {articles.map((entry) => (
        <li key={entry._id} className="flex justify-between gap-x-6 py-5">
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <Link href={"/" + entry._id} className="text-sm font-semibold leading-6 text-white">{entry.subject}</Link>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <div className="mt-1 flex items-center gap-x-1.5">
              <p className="text-xs leading-5 text-gray-400">{entry.createDate}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
