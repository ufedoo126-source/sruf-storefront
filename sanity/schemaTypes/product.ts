import { defineType, defineField } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "New Arrivals", value: "New Arrivals" },
          { title: "T-Shirts", value: "T-Shirts" },
          { title: "Polo", value: "Polo" },
          { title: "Outerwear", value: "Outerwear" },
          { title: "Accessories", value: "Accessories" },
        ],
      },
    }),
    defineField({
      name: "priceNGN",
      title: "Price (NGN ₦)",
      type: "number",
    }),
    defineField({
      name: "priceUSD",
      title: "Price (USD $)",
      type: "number",
    }),
    defineField({
      name: "images",
      title: "Product Images",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "badge",
      title: "Badge (e.g. NEW DROP, POPULAR)",
      type: "string",
    }),
    defineField({
      name: "isOut",
      title: "Sold Out?",
      type: "boolean",
      initialValue: false,
    }),
  ],
});