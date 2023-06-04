import { MongoClient } from 'mongodb';


export default async () => {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-master-api-v1');
  const items = await database.collection('requestHeaders').aggregate([
    {
      '$match': {
        'requestTypeId': 'RET20200102000003'
      }
    },
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
        'as': 'requestStatus'
      }
    }, {
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
        'masterEmployees': 0
      }
    }
  ]).limit(100).toArray();
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Account Requests</h1>
          <p className="mt-2 text-sm text-gray-700">A list of all the requests in your account including their system, title, type and dates.</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button type="button" className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Add request</button>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Type</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Created</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(entry => (
                  <tr>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{entry.requestType[0] == undefined ? '' : entry.requestType[0].requestTypeDescription}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.requestId}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="font-medium text-gray-900">{entry.subject}</div>
                          <div className="mt-2 flex flex-row gap-2">
                            {entry.masterSystems.map(system => <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{system.systemName}</span>)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{entry.requestStatus[0] == undefined ? '' : entry.requestStatus[0].statusDescription}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="font-medium text-gray-900">{entry.createDate}</div>
                          <div className="font-medium text-gray-900">{entry.createUser}</div>
                        </div>
                      </div>
                    </td>
                    {/* <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit<span className="sr-only">, Lindsay Walton</span></a>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
