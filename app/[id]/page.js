import { listItemDetails } from '../actions'
import List from '../list'

export default async ({ params }) => {
  const itemDetails = await listItemDetails(params.id)
  const markup = { __html: itemDetails.content }
  return (
    <>
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-base leading-7 text-gray-700">
          <h1 className="font-semibold text-white">{itemDetails.subject}</h1>
          <div dangerouslySetInnerHTML={markup} className="text-white" />
          <List />
        </div>
      </div>
    </>
  );
}
