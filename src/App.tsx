import { useQuery, gql } from '@apollo/client';
import { Spinner, Table, Thead, Tbody, Tr, Th, Td, Text, TableContainer, Heading, Box } from '@chakra-ui/react';

// graphQL query to fetch customers data
const GET_CUSTOMERS = gql`
  query GetCustomers {
    customers {
      id
      name
      email
      role
      city {
        name
      }
    }
  }
`;

function App() {


  const { loading, error, data } = useQuery(GET_CUSTOMERS);

  // loading and error handling
  if (loading) return <Spinner />; 

  if (error) return <Text>Something went wrong: {error.message}</Text>;

  // if everthing is fine show table data

  return (
    <Box p="6">
      <Heading mb="4" size="lg">Customers</Heading>
      <TableContainer border="1px solid" borderColor="gray.200" rounded="md">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>City</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.customers.map((customer: any) => (
              <Tr key={customer.id}>
                <Td>{customer.name}</Td>
                <Td>{customer.email}</Td>
                <Td>{customer.role}</Td>
                <Td>{customer.city.name}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default App;