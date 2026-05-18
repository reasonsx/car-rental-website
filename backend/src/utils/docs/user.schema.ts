// src/docs/user.docs.ts

export const userSchemas = {
  User: {
    type: "object",
    properties: {
      id: {
        type: "string",
        example: "65f1c2a9b7f4a8d123456789",
      },
      name: {
        type: "string",
        example: "Alice Smith",
      },
      email: {
        type: "string",
        example: "alice@example.com",
      },
      isAdmin: {
        type: "boolean",
        example: false,
      },
      isDeleted: {
        type: "boolean",
        example: false,
      },
    },
  },

  UserUpdateInput: {
    type: "object",
    properties: {
      name: {
        type: "string",
        example: "Alice Smith",
      },
      email: {
        type: "string",
        example: "alice@example.com",
      },
      isAdmin: {
        type: "boolean",
        example: true,
      },
      isDeleted: {
        type: "boolean",
        example: false,
      },
    },
  },
};