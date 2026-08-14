
# Customer Management App
A single webpage to view, add, edit, and delete customer records — like a basic **CRM**.

## Stack
- React
- Chakra UI
- Hasura (GraphQL, connected to Neon Postgres)
- Apollo Client

## Current Progress
Database and project setup done. Customers list is fetching and displaying from Hasura.
Currently building the "Add New Customer" feature.

## Setup Instructions
1. Clone this repository
2. Create a .env file then add these two variables REACT_APP_HASURA_GRAPHQL_URL and REACT_APP_HASURA_ADMIN_SECRET.
3. Run the following command to install dependencies and start the project:

```
npm install && npm start
```