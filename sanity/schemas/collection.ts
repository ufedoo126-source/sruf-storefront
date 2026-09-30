export default {
  name: 'collection',
  title: 'Collections',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Collection Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
};