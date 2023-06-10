import { MongoClient } from 'mongodb';
import Link from 'next/link';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid'


export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('requestHeaders').aggregate([
    {
      '$lookup': {
        'from': 'requestTypes',
        'localField': 'requestTypeId',
        'foreignField': 'requestTypeId',
        'as': 'requestType'
      }
    }, {
      '$lookup': {
        'from': 'requestStatuses',
        'localField': 'lastStatus',
        'foreignField': 'statusId',
        'as': 'requestStatuses'
      }
    },
    {
      '$addFields': {
        'lastStatus': {
          '$getField': {
            'field': 'statusDescription',
            'input': {
              '$arrayElemAt': [
                '$requestStatuses',
                0
              ]
            }
          }
        },
        'statusType': {
          '$getField': {
            'field': 'statusType',
            'input': {
              '$arrayElemAt': [
                '$requestStatuses',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$addFields': {
        'createDate': {
          $dateToString: {
            'date': {
              $dateFromString: {
                dateString: '$createDate'
              }
            },
            'format': '%Y-%m-%d %H:%M:%S'
          }
        },
      }
    }
    , {
      '$lookup': {
        'from': 'requestHeaderSystems',
        'localField': 'requestId',
        'foreignField': 'requestId',
        'as': 'requestHeaderSystems',
        'pipeline': [
          {
            '$project': {
              'systemId': 1
            }
          }
        ]
      }
    }, {
      '$addFields': {
        'requestHeaderSystems': {
          '$map': {
            'input': '$requestHeaderSystems',
            'as': 'entry',
            'in': '$$entry.systemId'
          }
        }
      }
    }, {
      '$lookup': {
        'from': 'masterSystems',
        'localField': 'requestHeaderSystems',
        'foreignField': 'systemId',
        'as': 'masterSystems'
      }
    },
    {
      '$lookup': {
        'from': 'masterEmployees',
        'localField': 'createUser',
        'foreignField': 'empId',
        'as': 'masterEmployees'
      }
    },
    {
      '$addFields': {
        'createUser': {
          '$getField': {
            'field': 'displayName',
            'input': {
              '$arrayElemAt': [
                '$masterEmployees',
                0
              ]
            }
          }
        }
      }
    },
    {
      '$project': {
        'masterEmployees': 0,
        'requestStatuses': 0
      }
    }
  ]).limit(100).toArray();

  const statusTypes = {
    C: 'text-green-700 bg-green-50 ring-green-600/20',
    N: 'text-gray-600 bg-gray-50 ring-gray-500/10',
    P: 'text-yellow-800 bg-yellow-50 ring-yellow-600/20',
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <>
      <ul role="list" className="divide-y divide-gray-100">
        {items.map((item) => (
          <li key={item.requestId} className="flex items-center justify-between gap-x-6 py-5">
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  <Link href="/" className="hover:underline">{item.subject}</Link>
                </p>
                <p
                  className={classNames(
                    statusTypes[item.statusType],
                    'rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset'
                  )}
                >
                  {item.lastStatus}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 truncate">
                {item.masterSystems.map(system => <span className="whitespace-nowrap">{system.systemName}</span>)}
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                <p className="truncate whitespace-nowrap">Created by {item.createUser} at {item.createDate}</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <div className="flex w-16 gap-x-2.5">
                <dt>
                  <span className="sr-only">Total comments</span>
                  <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </dt>
                <dd className="text-sm leading-6 text-gray-900">0</dd>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <a
            href="#"
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Previous
          </a>
          <a
            href="#"
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Next
          </a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{' '}
              <span className="font-medium">97</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              {/* Current: "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600", Default: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0" */}
              <a
                href="#"
                aria-current="page"
                className="relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                2
              </a>
              <a
                href="#"
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
              >
                3
              </a>
              <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                ...
              </span>
              <a
                href="#"
                className="relative hidden items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 md:inline-flex"
              >
                8
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                9
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                10
              </a>
              <a
                href="#"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
