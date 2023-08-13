'use server'

import { MongoClient, ObjectId } from 'mongodb';

export async function listItems(data, curr, size) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  let stages = []
  let items = await database.collection('articles').find().toArray();
  return JSON.parse(JSON.stringify(items))
}

export async function listItemDetails(id) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority");
  const database = client.db('ghg-baozhi-api-v1');
  let item = await database.collection('articles').findOne({ _id: new ObjectId(id) });
  return JSON.parse(JSON.stringify(item))
}

export async function listComments(data, curr, size) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  let stages = [
    {
      '$lookup': {
        'from': 'articles', 
        'localField': 'articleId', 
        'foreignField': '_id', 
        'as': 'article'
      }
    }, {
      '$addFields': {
        'article': {
          '$getField': {
            'field': 'subject', 
            'input': {
              '$arrayElemAt': [
                '$article', 0
              ]
            }
          }
        }
      }
    }
  ]

  if (data !== undefined && data instanceof FormData && data.has('searchType') && data.has('searchText') && data.get('searchText') !== '') {
    stages.unshift({
      '$match': {
        [data.get('searchType')]: data.get('searchText')
      }
    })
  }
  let items = await database.collection('comments')
    .aggregate(stages)
    .skip(curr !== undefined && size !== undefined ? curr * size : 0)
    .limit(size !== undefined ? size : 100)
    .toArray();
  return JSON.parse(JSON.stringify(items))
}

export async function addComment(data) {
  const client = new MongoClient("mongodb+srv://gogeonhyeok:qTAB0aDdtRBKocyx@cluster0.smqlq.mongodb.net/?retryWrites=true&w=majority")
  const database = client.db('ghg-baozhi-api-v1')
  await database.collection('comments').insertOne({
    ...Object.fromEntries(data.entries()),
    articleId: new ObjectId(data.get('articleId')),
    createDate: new Date()
  })
}